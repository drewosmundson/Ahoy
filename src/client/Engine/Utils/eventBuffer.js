

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

}




/*


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

    drainIndexOf() {
        const queue = this.queue
        this.queue = [];
        const length = queue.length;

        const items = [queue[0]];

        for (let i = 1; i < length; i++) {
            const item = queue[i];

            if (items.indexOf(item) === -1) {
                items.push(item);
            }
        }

        return items;
    }


    drainOptimized() {
        const queue = this.queue;
        this.queue = [];
        const length = queue.length;

        if (length < 2) {
            return queue;
        }

        if (length === 2) {
            return queue[0] === queue[1]
                ? [queue[0]]
                : queue;
        }

        if (queue.length === 3) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2] ? [queue[0]] : [queue[0], queue[2]])
                : (queue[0] === queue[2]
                    ? [queue[0], queue[1]]
                    : (queue[1] === queue[2] ? [queue[0], queue[1]] : queue));
        }
        if (queue.length === 4) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? [queue[0]]
                        : [queue[0], queue[3]])
                    : (queue[2] === queue[3]
                        ? [queue[0], queue[2]]
                        : [queue[0], queue[2], queue[3]]))
                : (queue[0] === queue[2]
                    ? (queue[0] === queue[3]
                        ? [queue[0], queue[1]]
                        : (queue[1] === queue[3]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]]))
                    : (queue[1] === queue[2]
                        ? (queue[2] === queue[3]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]])
                        : (queue[1] === queue[3]
                            ? [queue[0], queue[1], queue[2]]
                            : (queue[2] === queue[3]
                                ? [queue[0], queue[1], queue[2]]
                                : queue))));
        }
        if (queue.length === 5) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0]]
                            : [queue[0], queue[3]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[2], queue[3]]
                            : [queue[0], queue[2], queue[3], queue[4]]))
                    : (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[2]]
                            : [queue[0], queue[2], queue[4]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[2], queue[3]]
                            : [queue[0], queue[2], queue[3], queue[4]])))
                : (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2]]
                            : [queue[0], queue[1], queue[2], queue[4]]))
                    : (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2]]
                            : [queue[0], queue[1], queue[2], queue[4]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2], queue[3]]
                            : queue)));
            }


        const items = [queue[0]];

        for (let i = 1; i < length; i++) {
            const item = queue[i];

            if (items.indexOf(item) === -1) {
                items.push(item);
            }
        }

        return items;
    }


    // This looks like madness and it might be. I rediscoved my desire to test the speed of functions optimizing for memeory with this
    // I would not put this in a production env as i think the maintainer would rather have somthing as simple and one mistake can fail silently
    
    drainSet() {
        const items = [...new Set(this.queue)];
        this.queue = [];
        return items;
    }
    
    // However this is optimized for my probelem at hand. I know duplicates are rare but need to be taken care of. I also know that I will have thousands of small lists between 0 and 5 elements at the most
    // I can take advantage of the constraints of the problem and remove duplicates for arrays length 0 - 5 with minimal extra memory at O(1) time. anything larger than 5 is in O(n)
    // In testing this consistantly ran faster than all other methods for these ranges
    drainSmall() {
        const queue = this.queue;
        this.queue = [];
        const length = queue.length

        if (length === 0) {
            return queue;
        }

        if (length === 1) {
            return queue;
        }

        if (length === 2) {
            return queue[0] === queue[1]
                ? [queue[0]]
                : queue;
        }

        if (length === 3) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2] ? [queue[0]] : [queue[0], queue[2]])
                : (queue[0] === queue[2]
                    ? [queue[0], queue[1]]
                    : (queue[1] === queue[2] ? [queue[0], queue[1]] : queue));
        }

        if (length === 4) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? [queue[0]]
                        : [queue[0], queue[3]])
                    : (queue[2] === queue[3]
                        ? [queue[0], queue[2]]
                        : [queue[0], queue[2], queue[3]]))
                : (queue[0] === queue[2]
                    ? (queue[0] === queue[3]
                        ? [queue[0], queue[1]]
                        : (queue[1] === queue[3]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]]))
                    : (queue[1] === queue[2]
                        ? (queue[2] === queue[3]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]])
                        : (queue[1] === queue[3]
                            ? [queue[0], queue[1], queue[2]]
                            : (queue[2] === queue[3]
                                ? [queue[0], queue[1], queue[2]]
                                : queue))));
        }
        if (length === 5) {
            return queue[0] === queue[1]
                ? (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0]]
                            : [queue[0], queue[3]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[2], queue[3]]
                            : [queue[0], queue[2], queue[3], queue[4]]))
                    : (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[2]]
                            : [queue[0], queue[2], queue[4]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[2], queue[3]]
                            : [queue[0], queue[2], queue[3], queue[4]])))
                : (queue[1] === queue[2]
                    ? (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[1]]
                            : [queue[0], queue[1], queue[3]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2]]
                            : [queue[0], queue[1], queue[2], queue[4]]))
                    : (queue[2] === queue[3]
                        ? (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2]]
                            : [queue[0], queue[1], queue[2], queue[4]])
                        : (queue[3] === queue[4]
                            ? [queue[0], queue[1], queue[2], queue[3]]
                            : queue)));
            }

        return [...new Set(queue)];

    }
    testing() {
        const test = (listLength) => {
            const iterations = 1000000000;

            const comparingFunctions = [
                this.drain.bind(this),
                this.drainSet.bind(this),
                this.drainIndexOf.bind(this),
                this.drainSmall.bind(this),
                this.drainOptimized.bind(this)
            ];

            const results = [];

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

                results.push({
                    name: func.name,
                    averageTime: totalTime / iterations
                });
            }

            // Fastest first
            results.sort((a, b) => a.averageTime - b.averageTime);


            console.log(`\nQueue length: ${listLength}`);

            results.forEach((result, index) => {
                console.log(
                    `${index + 1}. ${result.name}: ${result.averageTime.toFixed(10)} ms`
                );
            });
        };

        test(0);
        test(1);
        test(2);
        test(3);
        test(4);
        test(5);
        test(6);
        test(10);

    }

}


class Bus {
    on() {}
}

const bus = new Bus();
const eventBuffer = new EventBuffer(bus, "test");

eventBuffer.testing();


// given the speeds of these functions. The testing of all of this was likley unndessesary but I feel like I have aquired another skill.
/*
My results for 1,000,000,000 iterations
Queue length: 0
1. bound drain:          0.0000510413 ms
2. bound drainOptimized: 0.0000556708 ms
3. bound drainSmall:     0.0000563390 ms
4. bound drainIndexOf:   0.0000564019 ms
5. bound drainSet:       0.0000810036 ms
 
Queue length: 1
1. bound drainOptimized: 0.0000560124 ms
2. bound drainIndexOf:   0.0000563233 ms
3. bound drainSmall:     0.0000564960 ms
4. bound drain:          0.0000571784 ms
5. bound drainSet:       0.0000883492 ms

Queue length: 2
1. bound drainSmall:     0.0000578731 ms
2. bound drainOptimized: 0.0000579925 ms
3. bound drain:          0.0000580843 ms
4. bound drainIndexOf:   0.0000684727 ms
5. bound drainSet:       0.0001002679 ms

Queue length: 3
1. bound drain:          0.0000576126 ms
2. bound drainOptimized: 0.0000590544 ms
3. bound drainSmall:     0.0000593760 ms
4. bound drainIndexOf:   0.0000759166 ms
5. bound drainSet:       0.0001183956 ms

Queue length: 4
1. bound drain: 0.0000565348 ms
2. bound drainSmall: 0.0000612906 ms
3. bound drainOptimized: 0.0000613071 ms
4. bound drainIndexOf: 0.0000845168 ms
5. bound drainSet: 0.0001268111 ms

Queue length: 5
1. bound drain: 0.0000588405 ms
2. bound drainOptimized: 0.0000603982 ms
3. bound drainSmall: 0.0000605523 ms
4. bound drainIndexOf: 0.0000932298 ms
5. bound drainSet: 0.0001410384 ms

Queue length: 6
1. bound drain: 0.0000565802 ms
2. bound drainIndexOf: 0.0001040483 ms
3. bound drainOptimized: 0.0001045400 ms
4. bound drainSet: 0.0001555071 ms
5. bound drainSmall: 0.0001563585 ms

Queue length: 10
1. bound drain:         0.0000566370 ms
2. bound drainIndexOf: 0.0001537056 ms
3. bound drainOptimized: 0.0001559096 ms
4. bound drainSmall:   0.0002283642 ms
5. bound drainSet:       0.0002330692 ms

*/