import TestEdge = require('./TestEdge');

class TestNode {
    constructor(abbreviation: string) {
        this.UniqueID = newGuid();
        this.Abbreviation = abbreviation;
    }
    UniqueID: string;
    Abbreviation: string;
    Weight: number = 15.0;
    Area: number = 0.0;
    Connect(otherNode: TestNode): TestEdge {
        return new TestEdge(this, otherNode);
    }
}

function newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string): string {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export = TestNode;