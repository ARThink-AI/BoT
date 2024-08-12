import Queue from "@/utils/queue"

let instance;

class TextQueue {
  constructor() {
   if ( !instance ) {
    instance = new Queue();
   }
   
  }
  getInstance() {
    return instance
  }
}
const singleTonTextQueue = new TextQueue();
export default singleTonTextQueue;