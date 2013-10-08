/// <reference path="../scripts/Fayde.d.ts" />
/// <reference path="../scripts/KineticGraph.d.ts" />

module KineticGraph.Test.ViewModels {
    export class TestNode implements Controls.ILinkable {
        constructor() {
            this.UniqueID = newGuid();
        }
        UniqueID: string;
        Connect(otherNode: TestNode): TestEdge {
            return new TestEdge(this, otherNode);
        }
    }
    export class TestEdge implements Controls.ILinkableEdge {
        Source: Controls.ILinkable;
        Sink: Controls.ILinkable;
        constructor(source: Controls.ILinkable, sink: Controls.ILinkable) {
            this.Source = source;
            this.Sink = sink;
        }
    }

    export class TestViewModel extends Fayde.MVVM.ObservableObject {
        AddNodeCommand: Fayde.MVVM.RelayCommand;
        Nodes = new Fayde.Collections.ObservableCollection<TestNode>();
        Edges = new Fayde.Collections.ObservableCollection<TestEdge>();

        private _Repulsion = 300.0;
        get Repulsion(): number { return this._Repulsion; }
        set Repulsion(value: number) { this._Repulsion = value; this.OnPropertyChanged("Repulsion"); }

        private _SpringTension = 0.009;
        get SpringTension(): number { return this._SpringTension; }
        set SpringTension(value: number) { this._SpringTension = value; this.OnPropertyChanged("SpringTension"); }

        constructor() {
            super();
            this.AddNodeCommand = new Fayde.MVVM.RelayCommand(() => this.AddNode_Execute);
            this.Load();
        }

        Load() {
            var georgia = new TestNode();
            var florida = new TestNode();
            var sc = new TestNode();
            var tennesse = new TestNode();
            var nc = new TestNode();
            var alabama = new TestNode();

            var nodes = this.Nodes;
            nodes.Add(georgia);
            nodes.Add(florida);
            nodes.Add(sc);
            nodes.Add(tennesse);
            nodes.Add(nc);
            nodes.Add(alabama);

            var edges = this.Edges;
            edges.Add(georgia.Connect(florida));
            edges.Add(georgia.Connect(sc));
            edges.Add(georgia.Connect(nc));
            edges.Add(georgia.Connect(tennesse));
            edges.Add(georgia.Connect(alabama));

            edges.Add(alabama.Connect(tennesse));
            edges.Add(alabama.Connect(florida));

            edges.Add(nc.Connect(sc));

            edges.Add(nc.Connect(tennesse));
        }

        private AddNode_Execute() {
            var newNode = new TestNode();
            this.Nodes.Add(newNode);

            var newEdges: TestEdge[] = [];
            var randomCount = randomInt(1, 4);
            for (var i = 0; i < randomCount; i++) {
                var existingNode = this.Nodes[randomInt(0, 3)];
                if (newEdges.some(te => te.Source.UniqueID === existingNode.UniqueID || te.Sink.UniqueID === existingNode.UniqueID)) {
                    i--;
                    continue;
                }
                if (randomInt(0, 2) == 1)
                    newEdges.push(newNode.Connect(existingNode));
                else
                    newEdges.push(existingNode.Connect(newNode));
            }

            this.Edges.AddRange(newEdges);
        }
    }
    Fayde.RegisterType(TestViewModel, {
        Name: "TestViewModel",
        Namespace: "KineticGraph.Test.ViewModels",
        XmlNamespace: "folder:ViewModels"
    });

    function randomInt(low: number, high: number): number {
        return Math.floor(Math.random() * (high - low) + low);
    }

    function newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string): string {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}