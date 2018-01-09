export function auth(username, password) {
  return {
    types: ['LOAD', 'AWESOME', 'OH_NO'],
    payload: {
      request: {
          method: 'post',
          url: '/users/auth_monitor',
        data: {
            username: username,
            password: password,
        }
      },
    }
  };
}


export function getActiveRoutes() {
  return {
    types: ['LOAD', 'AWESOME', 'OH_NO'],
    payload: {
      request: {
          method: 'get',
          url: '/routes/active',
      },
    }
  };
}
