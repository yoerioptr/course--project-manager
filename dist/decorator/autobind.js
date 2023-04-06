export function autobind(_, _2, descriptor) {
    return {
        configurable: true,
        get() {
            return descriptor.value.bind(this);
        }
    };
}
//# sourceMappingURL=autobind.js.map