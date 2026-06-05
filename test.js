function User(name) {
  this.name = name;
}

User.prototype.sayHello = function () {
  console.log("Hello");
};

const user1 = new User("Pallu");

console.log(user1.sayHello());
