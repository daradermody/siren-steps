import UserData, { type User } from './user_data.ts'


const PUBLIC_API_ROUTES: Record<string, PublicRequestHandler> = {
  'GET /': () => new Response('ok'),
  'GET /teamStats': async () => Response.json(await getTeamStats()),
  'GET /users': async () => Response.json(await UserData.getAll()),
}

const LOGGED_IN_ROUTES: Record<string, RequestHandler> = {
  'GET /me': (_, context) => Response.json(context.user),
  'GET /mySteps': (_, context) => Response.json(context.user.steps),
  'POST /mySteps': async (req, context) => UserData.submitSteps(context.user.name, (await req.json()).steps),
  'POST /mySteps/_delete': async (req, context) => UserData.deleteSteps(context.user.name, (await req.json()).date),
}

const ADMIN_ROUTES: Record<string, RequestHandler> = {
  'GET /usersWithTokens': async () => Response.json(await UserData.getAllWithToken()),
  'POST /addUser': async (req) => {
    const {name, team} = await req.json()
    if (!name || !team) {
      return new Response('Both name and team are required', {status: 400})
    }
    const token = await UserData.addUser(name, team)
    return new Response(token)
  },
  'POST /editUser': async (req) => {
    const {previousName, name, team} = await req.json()
    if (!previousName || (!name && !team)) {
      return new Response('previousName is required with either name or team', {status: 400})
    }
    await UserData.editUser(previousName, name, team)
  },
  'POST /deleteUser': async (req) => {
    const {name} = await req.json()
    if (!name) {
      return new Response('name is required', {status: 400})
    }
    await UserData.deleteUser(name)
  },
  'POST /setAdmin': async (req) => {
    const {name, isAdmin} = await req.json()
    if (!name || isAdmin === undefined) {
      return new Response('name and isAdmin are required', {status: 400})
    }
    await UserData.setAdmin(name, isAdmin)
  }
}

export default async function handleApiRequest(req: Request) {
  const path = new URL(req.url).pathname.replace(/^\/api/, '')
  const handlerKey = `${req.method} ${path}`
  if (PUBLIC_API_ROUTES[handlerKey]) {
    return PUBLIC_API_ROUTES[handlerKey](req)
  } else if (LOGGED_IN_ROUTES[handlerKey]) {
    const context = await getLoggedInContext(req)
    return LOGGED_IN_ROUTES[handlerKey](req, context)
  } else if (ADMIN_ROUTES[handlerKey]) {
    const context = await getLoggedInContext(req)
    if (!context.user.isAdmin) {
      return new Response('Must be admin', {status: 403})
    }
    return ADMIN_ROUTES[handlerKey](req, context)
  } else {
    return new Response('Not found', {status: 404})
  }
}

type PublicRequestHandler = (req: Request) => Response | void | Promise<Response | void>
type RequestHandler = (req: Request, context: Context) => Response | void | Promise<Response | void>

async function getLoggedInContext(req: Request): Promise<Context> {
  const token = new URL(req.url).searchParams.get('token') || req.headers.get('token')
  if (!token) {
    throw Response.json({error: 'Login token required (?token=abc)'}, {status: 401})
  } else if (UserData.isAdminToken(token)) {
    return {user: {name: 'Admin', team: 'N/A', steps: [], totalSteps: 0, isAdmin: true}}
  } else {
    return {user: await UserData.getByToken(token)}
  }
}

async function getTeamStats(): Promise<TeamStat[]> {
  const users = await UserData.getAll()
  const usersByTeam = Object.groupBy(users, user => user.team)
  return Object.entries(usersByTeam)
    .map(([teamName, members]) => ({
      name: teamName,
      steps: sum(members!.map(member => member.totalSteps)),
      members: members!
    }))
}

interface Context {
  user: User
}

export interface TeamStat {
  name: string;
  steps: number;
  members: User[]
}

const sum = (nums: number[]) => nums.reduce((acc, current) => acc + current, 0)

