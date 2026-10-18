




export class Controlled {
    static create({ speed } = {}) {
        return {
            speed: speed ?? 5,
        };
    }
}