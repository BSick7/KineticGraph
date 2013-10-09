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
            var nodes = this.Nodes;
            var edges = this.Edges;
            
            var florida = this.AddState();
            var georgia = this.AddState(florida);
            var sc = this.AddState(georgia);
            var alabama = this.AddState(florida, georgia);
            var tennessee = this.AddState(georgia, alabama);
            var nc = this.AddState(sc, tennessee, georgia);
            var mississippi = this.AddState(alabama, tennessee);
            var virginia = this.AddState(nc, tennessee);
            var kentucky = this.AddState(tennessee, virginia);
            var wv = this.AddState(kentucky, virginia);
            var maryland = this.AddState(wv, virginia);
            var delaware = this.AddState(maryland);
            var nj = this.AddState(delaware);
            var penn = this.AddState(wv, maryland, delaware, nj);
            var ny = this.AddState(penn, nj);
            var conn = this.AddState(ny);
            var rhode = this.AddState(conn);
            var mass = this.AddState(ny, conn, rhode);
            var vermont = this.AddState(ny, mass);
            var nh = this.AddState(mass, vermont);
            var maine = this.AddState(nh);
            var ohio = this.AddState(penn, wv, kentucky);
            var michigan = this.AddState(ohio);
            var indiana = this.AddState(michigan, ohio, kentucky);
            var illinois = this.AddState(kentucky, indiana);
            var wisconsin = this.AddState(michigan, illinois);
            var minnesota = this.AddState(wisconsin);
            var iowa = this.AddState(minnesota, wisconsin, illinois);
            var missouri = this.AddState(iowa, illinois, kentucky, tennessee);
            var arkansas = this.AddState(missouri, tennessee, mississippi);
            var louisiana = this.AddState(arkansas, mississippi);
            var texas = this.AddState(louisiana, arkansas);
            var oklahoma = this.AddState(texas, arkansas, missouri);
            var kansas = this.AddState(oklahoma, missouri);
            var nebraska = this.AddState(kansas, missouri, iowa);
            var sd = this.AddState(nebraska, iowa, minnesota);
            var nd = this.AddState(sd, minnesota);
            var montana = this.AddState(nd, sd);
            var wyoming = this.AddState(montana, nd, sd, nebraska);
            var colorado = this.AddState(wyoming, nebraska, kansas, oklahoma);
            var nm = this.AddState(colorado, oklahoma, texas);
            var arizona = this.AddState(nm);
            var utah = this.AddState(wyoming, arizona, colorado);
            var idaho = this.AddState(montana, wyoming, utah);
            var washington = this.AddState(idaho);
            var oregon = this.AddState(washington, idaho);
            var nevada = this.AddState(oregon, idaho, utah, arizona);
            var california = this.AddState(oregon, nevada, arizona);
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

        private AddState(...connections: TestNode[]): TestNode {
            var node = new TestNode();
            this.Nodes.Add(node);
            if (!connections)
                return node;
            var len = connections.length;
            for (var i = 0; i < len; i++) {
                this.Edges.Add(node.Connect(connections[i]));
            }
            return node;
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