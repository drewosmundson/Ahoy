


class EventBuffer {
    constructor(eventBus, bufferedEvent) {
        this.queue = [];
        this.cashe = Object.create(null)
        
        eventBus.on(bufferedEvent, (data) => this.queue.push(data));
    }
    drain() {
        const items = this.queue;
        this.queue = [];
        return items;
    }
    drainFastNoDuplicates () {
        const items = new Set(...this.queue)
        this.queue = [];
        return items;
    } 
    drainEfficientNoDuplicates () {
        
        const length = this.queue.length
        
        for (let i = 0; i < length; i++) {
            const item = arr[i];
            if (!seen.has(item)) {
                seen.add(item);
                result.push(item);

           }
        return result 
    }
    
    // to test each of the 3 methods 
testing() 

    test(1) 
    test(2) 
    test(3) 
    test(4) 
    test(5) 
    test(10)
    test(20)
    test(100) 
    test(1000) 
    
    
    
    function test(listLength) {
        const iterations = 10000
        const comparingFunctions = [
            this.drain,
            this.drainFastNoDuplacates,
            this.drainEfficientNoDuplacates,
        ]
        
        comparingFunctions.foreach((func) => { 
            let averageTime = 0
            let averageMemory = 0
            while (iterations < 0) {
                this.queue = [] 
                this.cache = 
                for(let i = 0; i < listLength; i++) {
                    this.queue.push(math.random(1,11))
                }
                timeBefore = performamce.now() 
                memoryBefore = performance.memory.usedJSHeapSize() 
                
                func()
                
                timeAfter = performamce.now() 
                memoryAfter = performance.memory.usedJSHeapSize() 
            
                averageTime += timeAfter - timeBefore 
                averageMemory += memoryAfter - memoryBefore 
            }
            averageTime /= iterations
            averageMemory /= iterations
            
            console.log ("tested Function: 
             comsole.log("time taken:" ${averageTime} 
             console.log(`Used Heap: ${averageMemory} / 1024 / 1024} MB`);
        } 
        
    } 
}


