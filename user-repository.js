const users = [{
    id: 1,
    login: 'bruce@waynecorp.com',
    firstName: 'Bruce',
    lastName: 'Wayne'
}, {
    id: 2,
    login: 'clark.kent@dailyplanet.com',
    firstName: 'Clark',
    lastName: 'Kent'
}];

module.exports = class UserRepository {
    findAll() {
        return users;
    }
    
    getOneById(id) {
      return users.find(item => item.id === id)
    }

    create({login,firstName, lastName }){
      const tempUser = {
        login,
        firstName,
        lastName,
        id: users[users.length-1].id + 1
      }
      users.push(tempUser);
      console.log("tempUser", tempUser)
      return tempUser

    }
}