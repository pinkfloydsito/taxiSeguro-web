// export const auth = (user, password) => ({
//   type: 'REQUEST',
//   payload: {
//     request: {
//       url: '/login'
//     }
//   }
// });

export const setUser = (user = { name: '', password: '' }) => ({
  type: 'SET_USER',
  payload: {
    user
  }
});
