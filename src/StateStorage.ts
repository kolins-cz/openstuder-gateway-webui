class StateStorage {
    private storage = new Map<string,any>();

    saveState<Type>(id: string, state: Type) {
        this.storage.set(id, state);
    }

    getState<Type>(id: string, defaultStateFunction: () => Type): Type {
        return this.storage.get(id) || defaultStateFunction();
    }

    clearAllStates() {
        this.storage.clear();
    }
}

export default StateStorage;