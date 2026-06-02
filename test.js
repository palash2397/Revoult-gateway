let a = 10;

function first() {
   let b = 20;
   second();
}

function second() {
   let c = 30;
   console.log("done");
}

first();