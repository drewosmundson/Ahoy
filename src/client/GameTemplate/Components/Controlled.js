




export class Controlled {
    static createControlledComponent({ speed } = {}) {
        return {
            speed: speed ?? 5,
        };
    }
}