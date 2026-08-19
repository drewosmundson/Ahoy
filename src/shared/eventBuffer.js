


class EventBuffer {
    constructor(eventBus, bufferedEvent) {
        this.queue = [];
        
        eventBus.on(bufferedEvent, (data) => this.queue.push(data));
    }
    drain() {
        const items = this.queue;
        this.queue = [];
        return items;
    }
    drainSet () {
        const items = [...new Set(this.queue)]
        this.queue = [];
        return items;
    } 
    drainObject() {
        const items = [];
        const seen = {};
        for (const item of this.queue) {
            if (!seen[item]) {
                seen[item] = true;
                items.push(item);
            }
        }
        this.queue = [];
        return items;
    }
    drainIndexOf() {
        const items = [];
        for (const item of this.queue) {
            if (items.indexOf(item) === -1) {
                items.push(item);
            }
        }
        this.queue = [];
        return items;
    }
    drainManual() {
        const items = [];
        for (const item of this.queue) {
            let duplicate = false;
            for (let i = 0; i < items.length; i++) {
                if (items[i] === item) {
                    duplicate = true;
                    break;
                }
            }
            if (!duplicate) {
                items.push(item);
            }
        }
        this.queue = [];
        return items;
    }
    drainSmall() {
        const queue = this.queue;
        this.queue = [];
    
        if (queue.length <= 1) {
            return queue;
        }
        if (queue.length === 2) {
            if (queue[0] === queue[1]) {
                return [queue[0]];
            }
    
            return queue;
        }
        return [...new Set(queue)];
    }
    
    
    // to test each of the 3 methods 
testing() {
    const test = (listLength) => {
        const iterations = 10000
        const comparingFunctions = [
            this.drain,
            this.drainFastNoDuplacates,
            this.drainEfficientNoDuplacates,
        ]
        
        comparingFunctions.foreach((func) => { 
            this.queue = [] 
            let averageTime = 0
            let averageMemory = 0
            while (iterations>0) {

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
                iterations--; 
            }
            averageTime /= iterations
            averageMemory /= iterations
            
            console.log ("tested Function: ${func}
             comsole.log("time taken:" ${averageTime} 
             console.log(`Used Heap: ${averageMemory} / 1024 / 1024} MB`);
        }
    }
    test(0) 
    test(1) 
    test(2) 
    test(10)
    test(20)
    test(100) 
    test(1000) 
    
}

class Bus {
    on(){}
}

const bus = new Bus()
const eventBuffer = new EventBuffer(bus)
eventBuffer.testing() 


class EventBuffer {
    constructor(eventBus, bufferedEvent) {
        this.queue = [];

        eventBus.on(bufferedEvent, (data) => {
            this.queue.push(data);
        });
    }

    drain() {
        const items = this.queue;
        this.queue = [];
        return items;
    }

    drainSet() {
        const items = [...new Set(this.queue)];
        this.queue = [];
        return items;
    }

    drainObject() {
        const items = [];
        const seen = Object.create(null);

        for (const item of this.queue) {
            const key = String(item);

            if (!seen[key]) {
                seen[key] = true;
                items.push(item);
            }
        }

        this.queue = [];
        return items;
    }

    drainIndexOf() {
        const items = [];

        for (const item of this.queue) {
            if (items.indexOf(item) === -1) {
                items.push(item);
            }
        }

        this.queue = [];
        return items;
    }

    drainManual() {
        const items = [];

        for (const item of this.queue) {
            let duplicate = false;

            for (let i = 0; i < items.length; i++) {
                if (items[i] === item) {
                    duplicate = true;
                    break;
                }
            }

            if (!duplicate) {
                items.push(item);
            }
        }

        this.queue = [];
        return items;
    }

    drainSmall() {
        const queue = this.queue;
        this.queue = [];

        if (queue.length <= 1) {
            return queue;
        }

        if (queue.length === 2) {
            return queue[0] === queue[1]
                ? [queue[0]]
                : queue;
        }

        return [...new Set(queue)];
    }

    testing() {
        const test = (listLength) => {
            const iterations = 10000;

            const comparingFunctions = [
                this.drain.bind(this),
                this.drainSet.bind(this),
                this.drainObject.bind(this),
                this.drainIndexOf.bind(this),
                this.drainManual.bind(this),
                this.drainSmall.bind(this)
            ];

            console.log(`\nQueue length: ${listLength}`);

            for (const func of comparingFunctions) {
                let totalTime = 0;

                for (let iteration = 0; iteration < iterations; iteration++) {
                    this.queue = [];

                    for (let i = 0; i < listLength; i++) {
                        this.queue.push(
                            Math.floor(Math.random() * 11) + 1
                        );
                    }

                    const timeBefore = performance.now();

                    func();

                    const timeAfter = performance.now();

                    totalTime += timeAfter - timeBefore;
                }

                const averageTime = totalTime / iterations;

                console.log(
                    `${func.name}: ${averageTime.toFixed(6)} ms`
                );
            }
        };

        test(0);
        test(1);
        test(2);
        test(10);
        test(20);
        test(100);
        test(1000);
    }
}

class Bus {
    on() {}
}

const bus = new Bus();
const eventBuffer = new EventBuffer(bus, "test");

eventBuffer.testing();


