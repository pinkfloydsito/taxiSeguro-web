export const auth = (user, password) => ({
  type: 'REQUEST',
  payload: {
    request: {
      url: '/login'
    }
  }
});
