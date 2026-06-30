class User {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    console.log("Hello");
  }
}

const user1 = new User("Pallu");

console.log(user1.sayHello());
