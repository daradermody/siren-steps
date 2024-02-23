import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as EuiIconSortUp } from '@elastic/eui/es/components/icon/assets/sort_up';
import { icon as EuiIconSortDown } from '@elastic/eui/es/components/icon/assets/sort_down';
import { icon as EuiIconMinusInCircle } from '@elastic/eui/es/components/icon/assets/minus_in_circle';
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross';
import { icon as EuiIconPopout } from '@elastic/eui/es/components/icon/assets/popout';

// One or more icons are passed in as an object of iconKey (string): IconComponent
appendIconComponentCache({
  arrowDown: EuiIconArrowDown,
  arrowRight: EuiIconArrowRight,
  sortUp: EuiIconSortUp,
  sortDown: EuiIconSortDown,
  minusInCircle: EuiIconMinusInCircle,
  cross: EuiIconCross,
  popout: EuiIconPopout,
});
