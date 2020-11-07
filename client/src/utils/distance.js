import * as distance from '@turf/distance';
import * as point from 'turf-point';
//pass in parameters as list

export function findDistance(point1, point2) {
  const from = point(point1);
  const to = point(point2);
  const options = { units: 'miles' };
  const pointDistance = distance.default(from, to, options);
  return pointDistance;
}

// function getCurrentLocation(options) {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       resolve,
//       ({ code, message }) =>
//         reject(
//           Object.assign(new Error(message), { name: 'PositionError', code })
//         ),
//       options
//     );
//   });
// }

async function getCoordinates(options) {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  })
}

export async function inOutLocation() {
  const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
  return await getCoordinates(options).then(position => {
    return position;
  })
}

// export async function inOutLocation() {
//   return await getCurrentLocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
//     .catch(e => {
//       if (e.name === 'PositionError') {
//         console.log(e.message + '. code = ' + e.code);
//       }
//     })
// }