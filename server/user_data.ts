const dataDir = Bun.env.DATA_DIR || `${import.meta.dir}/data`
const adminToken = Bun.env.ADMIN_TOKEN
if (!adminToken) {
  throw new Error('ADMIN_TOKEN environment variable needed on the very first start')
}

export default class UserData {
  private static file = Bun.file(`${dataDir}/users.json`)
  private static users: StoredUser[]

  static async getByToken(token: string): Promise<User> {
    const users = await this.getAllWithToken()
    const user = users.find(user => user.token === token)
    if (!user) {
      throw Response.json({ error: 'User not found for token' }, {status: 404})
    }
    return stripPrivateAttributes(user)
  }

  static async getAll(): Promise<User[]> {
    const users = await this.getAllWithToken()
    return users.map(stripPrivateAttributes)
  }

  static async getAllWithToken(): Promise<StoredUser[]> {
    if (!this.users) {
      if (await this.file.exists()) {
        const users: Omit<StoredUser, 'totalSteps'>[] = await this.file.json()
        this.users = users.map(user => ({
          ...user,
          totalSteps: sum(user.steps.map(stepSub => stepSub.steps))
        }))
      } else {
        this.users = []
        await this.saveUsers()
      }
    }
    return this.users
  }

  private static async getUserByName(name: string): Promise<StoredUser> {
    const user = (await this.getAllWithToken()).find(user => user.name === name)
    if (!user) {
      throw new Error(`User not found with name "${name}"`)
    }
    return user
  }

  static async submitSteps(name: string, steps: number) {
    const user = await this.getUserByName(name)
    user.steps = [{date: new Date().toISOString(), steps}, ...user.steps]
    user.totalSteps = sum(user.steps.map(stepSub => stepSub.steps))
    await this.updateUser(user)
  }

  static async deleteSteps(name: string, date: string) {
    const user = (await this.getAll()).find(user => user.name === name)
    if (!user) {
      throw new Error(`User not found with name "${name}"`)
    }
    user.steps = user.steps.filter(submission => submission.date !== date)
    user.totalSteps = sum(user.steps.map(stepSub => stepSub.steps))
    await this.updateUser(user)
  }

  private static async updateUser(user: User) {
    this.users = this.users.map(u => u.name === user.name ? {...u, ...user} : u)
    await this.saveUsers()
  }

  static async addUser(name: string, team: string): Promise<string> {
    if (this.users.find(user => user.name === name)) {
      throw Response.json({ error: 'User with name already exists' }, {status: 409})
    }
    const newUser: StoredUser = { name, team, token: crypto.randomUUID(), steps: [], totalSteps: 0, isAdmin: false }
    this.users.push(newUser)
    await this.saveUsers()
    return newUser.token
  }

  static async editUser(previousName: string, name?: string, team?: string): Promise<void> {
    const user = await this.getUserByName(previousName)
    if (name !== previousName && this.users.find(user => user.name === name)) {
      throw Response.json({ error: `New name "${name}" can't be used as a user with this name already exists` }, {status: 409})
    }
    user.name = name || user.name
    user.team = team || user.team
    await this.updateUser(user)
  }

  static async setAdmin(name: string, isAdmin: boolean): Promise<void> {
    const user = await this.getUserByName(name)
    user.isAdmin = isAdmin
    await this.updateUser(user)
  }

  static async deleteUser(name: string): Promise<void> {
    await this.getUserByName(name)
    this.users = this.users.filter(user => user.name !== name)
    await this.saveUsers()
  }

  private static async saveUsers() {
    await Bun.write(this.file, JSON.stringify(this.users, null, 2))
  }

  public static isAdminToken(token: string): boolean {
    return token === adminToken
  }
}

function stripPrivateAttributes(user: StoredUser): User {
  const {token: _, ...publicUserInfo} = user
  return publicUserInfo
}

export interface User {
  name: string;
  team: string;
  totalSteps: number;
  steps: StepSubmission[];
  isAdmin: boolean;
}

export type UserWithToken = User & { token: string }

type StoredUser = UserWithToken

export interface StepSubmission {
  date: string;
  steps: number;
}

const sum = (nums: number[]) => nums.reduce((acc, current) => acc + current, 0)
