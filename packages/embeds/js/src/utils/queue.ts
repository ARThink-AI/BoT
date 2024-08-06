export default class Queue {
  constructor() {
    this.items = [];
  }

  // Enqueue method to add an element to the queue
  enqueue(element) {
    this.items.push(element);
  }

  // Dequeue method to remove an element from the queue
  dequeue() {
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.shift();
  }

  // Front method to get the front element of the queue
  front() {
    if (this.isEmpty()) {
      return "Queue is empty";
    }
    return this.items[0];
  }

  // isEmpty method to check if the queue is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Print method to display the elements of the queue
  printQueue() {
    let str = "";
    for (let i = 0; i < this.items.length; i++) {
      str += this.items[i] + " ";
    }
    return str;
  }
}
// export default  Queue;