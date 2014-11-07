import TestNode = require('../Models/TestNode');
import TestEdge = require('../Models/TestEdge');

var WEIGHT_RANGE = { Low: 12, High: 50 };

class TestViewModel extends Fayde.MVVM.ViewModelBase {
    AddNodeCommand: Fayde.MVVM.RelayCommand;
    Nodes = new Fayde.Collections.ObservableCollection<TestNode>();
    Edges = new Fayde.Collections.ObservableCollection<TestEdge>();

    private _Repulsion = 300.0;
    get Repulsion (): number {
        return this._Repulsion;
    }

    set Repulsion (value: number) {
        this._Repulsion = value;
        this.OnPropertyChanged("Repulsion");
    }

    private _SpringTension = 0.009;
    get SpringTension (): number {
        return this._SpringTension;
    }

    set SpringTension (value: number) {
        this._SpringTension = value;
        this.OnPropertyChanged("SpringTension");
    }

    constructor () {
        super();
        this.AddNodeCommand = new Fayde.MVVM.RelayCommand(() => this.AddNode_Execute);
        this.Load();
    }

    Load () {
        var nodes = this.Nodes;
        var edges = this.Edges;

        var florida = this.AddState("FL");
        florida.Area = 69898;
        var georgia = this.AddState("GA", florida);
        georgia.Area = 65498
        var sc = this.AddState("SC", georgia);
        sc.Area = 32020;
        var alabama = this.AddState("AL", florida, georgia);
        alabama.Area = 51480;
        var tennessee = this.AddState("TN", georgia, alabama);
        tennessee.Area = 42143;
        var nc = this.AddState("NC", sc, tennessee, georgia);
        nc.Area = 53819;
        var mississippi = this.AddState("MS", alabama, tennessee);
        mississippi.Area = 46055;
        var virginia = this.AddState("VA", nc, tennessee);
        virginia.Area = 53179;
        var kentucky = this.AddState("KY", tennessee, virginia);
        kentucky.Area = 40409;
        var wv = this.AddState("WV", kentucky, virginia);
        wv.Area = 24230;
        var maryland = this.AddState("MD", wv, virginia);
        maryland.Area = 12407;
        var delaware = this.AddState("DE", maryland);
        delaware.Area = 2489;
        var nj = this.AddState("NJ", delaware);
        nj.Area = 8721;
        var penn = this.AddState("PA", wv, maryland, delaware, nj);
        penn.Area = 44825;
        var ny = this.AddState("NY", penn, nj);
        ny.Area = 54556;
        var conn = this.AddState("CT", ny);
        conn.Area = 5543;
        var rhode = this.AddState("RI", conn);
        rhode.Area = 1545;
        var mass = this.AddState("MA", ny, conn, rhode);
        mass.Area = 10555;
        var vermont = this.AddState("VT", ny, mass);
        vermont.Area = 9614;
        var nh = this.AddState("NH", mass, vermont);
        nh.Area = 9350;
        var maine = this.AddState("ME", nh);
        maine.Area = 36148;
        var ohio = this.AddState("OH", penn, wv, kentucky);
        ohio.Area = 42774;
        var michigan = this.AddState("MI", ohio);
        michigan.Area = 82277;
        var indiana = this.AddState("IN", michigan, ohio, kentucky);
        indiana.Area = 35385;
        var illinois = this.AddState("IL", kentucky, indiana);
        illinois.Area = 57914;
        var wisconsin = this.AddState("WI", michigan, illinois);
        wisconsin.Area = 59425;
        var minnesota = this.AddState("MN", wisconsin);
        minnesota.Area = 97790;
        var iowa = this.AddState("IA", minnesota, wisconsin, illinois);
        iowa.Area = 56272;
        var missouri = this.AddState("MO", iowa, illinois, kentucky, tennessee);
        missouri.Area = 65755;
        var arkansas = this.AddState("AR", missouri, tennessee, mississippi);
        arkansas.Area = 52419;
        var louisiana = this.AddState("LA", arkansas, mississippi);
        louisiana.Area = 48430;
        var texas = this.AddState("TX", louisiana, arkansas);
        texas.Area = 268581;
        var oklahoma = this.AddState("OK", texas, arkansas, missouri);
        oklahoma.Area = 69704;
        var kansas = this.AddState("KS", oklahoma, missouri);
        kansas.Area = 86939;
        var nebraska = this.AddState("NE", kansas, missouri, iowa);
        nebraska.Area = 77354;
        var sd = this.AddState("SD", nebraska, iowa, minnesota);
        sd.Area = 77116;
        var nd = this.AddState("ND", sd, minnesota);
        nd.Area = 70700;
        var montana = this.AddState("MT", nd, sd);
        montana.Area = 163696;
        var wyoming = this.AddState("WY", montana, sd, nebraska);
        wyoming.Area = 97818;
        var colorado = this.AddState("CO", wyoming, nebraska, kansas, oklahoma);
        colorado.Area = 104094;
        var nm = this.AddState("NM", colorado, oklahoma, texas);
        nm.Area = 121589;
        var arizona = this.AddState("AZ", nm);
        arizona.Area = 113998;
        var utah = this.AddState("UT", wyoming, arizona, colorado);
        utah.Area = 83570;
        var idaho = this.AddState("ID", montana, wyoming, utah);
        idaho.Area = 84899;
        var washington = this.AddState("WA", idaho);
        washington.Area = 71300;
        var oregon = this.AddState("OR", washington, idaho);
        oregon.Area = 98381;
        var nevada = this.AddState("NV", oregon, idaho, utah, arizona);
        nevada.Area = 110561;
        var california = this.AddState("CA", oregon, nevada, arizona);
        california.Area = 147042;

        this.DistributeStateWeights(WEIGHT_RANGE.Low, WEIGHT_RANGE.High);
    }

    private AddNode_Execute () {
        var newNode = new TestNode("");
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

    private AddState (abbreviation: string, ...connections: TestNode[]): TestNode {
        var node = new TestNode(abbreviation);
        this.Nodes.Add(node);
        if (!connections)
            return node;
        var len = connections.length;
        for (var i = 0; i < len; i++) {
            this.Edges.Add(node.Connect(connections[i]));
        }
        return node;
    }

    private DistributeStateWeights (low: number, high: number) {
        var nodes = this.Nodes;
        var enumerator = nodes.getEnumerator();
        var totalArea = 0.0;
        var minArea = Number.POSITIVE_INFINITY;
        var maxArea = Number.NEGATIVE_INFINITY;
        while (enumerator.moveNext()) {
            minArea = Math.min(minArea, enumerator.current.Area);
            maxArea = Math.max(maxArea, enumerator.current.Area);
            totalArea += enumerator.current.Area;
        }

        enumerator = nodes.getEnumerator();
        while (enumerator.moveNext()) {
            var normalized = (enumerator.current.Area - minArea) / (maxArea - minArea);
            enumerator.current.Weight = normalized * (high - low) + low;
        }
    }
}

function randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
}

export = TestViewModel;