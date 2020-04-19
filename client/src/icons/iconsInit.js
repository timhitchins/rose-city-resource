import { library } from '@fortawesome/fontawesome-svg-core';
//deep imports to reduce bundle size
import { faUtensils } from '@fortawesome/free-solid-svg-icons/faUtensils';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faTshirt } from '@fortawesome/free-solid-svg-icons/faTshirt';
import { faBusAlt } from '@fortawesome/free-solid-svg-icons/faBusAlt';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons/faMoneyBillWave';
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons/faHandHoldingHeart';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons/faBriefcase';
import { faBalanceScale } from '@fortawesome/free-solid-svg-icons/faBalanceScale';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faHandsHelping } from '@fortawesome/free-solid-svg-icons/faHandsHelping';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons/faMapMarker';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';

/*
Font Awesome Icons:
food - utensils
housing & shelter - home
goods(clothing, etc...) - tshirt
health & wellness - heartbeat
money (fin assistance) - money-bill-wave
care & safety - hand-holding-heart
work - briefcase
legal - balance-scale
day services - sun, coffee?
special assistance (youth services, glbtqi, etc..) - hands-helping?, 
*/

const categoryIcons = {
  food: faUtensils,
  housingAndShelter: faHome,
  goods: faTshirt,
  transit: faBusAlt,
  healthAndWellness: faHeartbeat,
  money: faMoneyBillWave,
  careAndSafety: faHandHoldingHeart,
  work: faBriefcase,
  legal: faBalanceScale,
  dayServices: faSun,
  specialAssistance: faHandsHelping
};

const appIcons = {
  hamburgerBars: faBars,
  plus: faPlus,
  minus: faMinus,
  search: faSearch,
  angleDown: faAngleDown,
  angleLeft: faAngleLeft,
  angleRight: faAngleRight,
  phone: faPhone,
  globe: faGlobe,
  print: faPrint,
  save: faSave,
  mapMarker: faMapMarker,
  spinner: faSpinner
};

//add them to the library to be used in all components
//import this script in the App component
Object.values(categoryIcons).map(icon => library.add(icon));
Object.values(appIcons).map(icon => library.add(icon));
