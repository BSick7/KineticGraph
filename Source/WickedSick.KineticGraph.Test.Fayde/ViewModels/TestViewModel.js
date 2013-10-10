var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KineticGraph;
(function (KineticGraph) {
    (function (Test) {
        /// <reference path="../scripts/Fayde.d.ts" />
        /// <reference path="../scripts/KineticGraph.d.ts" />
        (function (ViewModels) {
            var WEIGHT_RANGE = { Low: 12, High: 50 };

            var TestNode = (function () {
                function TestNode(abbreviation) {
                    this.Weight = 15.0;
                    this.Area = 0.0;
                    this.UniqueID = newGuid();
                    this.Abbreviation = abbreviation;
                }
                TestNode.prototype.Connect = function (otherNode) {
                    return new TestEdge(this, otherNode);
                };
                return TestNode;
            })();
            ViewModels.TestNode = TestNode;
            var TestEdge = (function () {
                function TestEdge(source, sink) {
                    this.Source = source;
                    this.Sink = sink;
                }
                return TestEdge;
            })();
            ViewModels.TestEdge = TestEdge;

            var TestViewModel = (function (_super) {
                __extends(TestViewModel, _super);
                function TestViewModel() {
                    var _this = this;
                    _super.call(this);
                    this.Nodes = new Fayde.Collections.ObservableCollection();
                    this.Edges = new Fayde.Collections.ObservableCollection();
                    this._Repulsion = 300.0;
                    this._SpringTension = 0.009;
                    this.AddNodeCommand = new Fayde.MVVM.RelayCommand(function () {
                        return _this.AddNode_Execute;
                    });
                    this.Load();
                }
                Object.defineProperty(TestViewModel.prototype, "Repulsion", {
                    get: function () {
                        return this._Repulsion;
                    },
                    set: function (value) {
                        this._Repulsion = value;
                        this.OnPropertyChanged("Repulsion");
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(TestViewModel.prototype, "SpringTension", {
                    get: function () {
                        return this._SpringTension;
                    },
                    set: function (value) {
                        this._SpringTension = value;
                        this.OnPropertyChanged("SpringTension");
                    },
                    enumerable: true,
                    configurable: true
                });

                TestViewModel.prototype.Load = function () {
                    var nodes = this.Nodes;
                    var edges = this.Edges;

                    var florida = this.AddState("FL");
                    florida.Area = 69898;
                    var georgia = this.AddState("GA", florida);
                    georgia.Area = 65498;
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
                };

                TestViewModel.prototype.AddNode_Execute = function () {
                    var newNode = new TestNode("");
                    this.Nodes.Add(newNode);

                    var newEdges = [];
                    var randomCount = randomInt(1, 4);
                    for (var i = 0; i < randomCount; i++) {
                        var existingNode = this.Nodes[randomInt(0, 3)];
                        if (newEdges.some(function (te) {
                            return te.Source.UniqueID === existingNode.UniqueID || te.Sink.UniqueID === existingNode.UniqueID;
                        })) {
                            i--;
                            continue;
                        }
                        if (randomInt(0, 2) == 1)
                            newEdges.push(newNode.Connect(existingNode));
else
                            newEdges.push(existingNode.Connect(newNode));
                    }

                    this.Edges.AddRange(newEdges);
                };

                TestViewModel.prototype.AddState = function (abbreviation) {
                    var connections = [];
                    for (var _i = 0; _i < (arguments.length - 1); _i++) {
                        connections[_i] = arguments[_i + 1];
                    }
                    var node = new TestNode(abbreviation);
                    this.Nodes.Add(node);
                    if (!connections)
                        return node;
                    var len = connections.length;
                    for (var i = 0; i < len; i++) {
                        this.Edges.Add(node.Connect(connections[i]));
                    }
                    return node;
                };
                TestViewModel.prototype.DistributeStateWeights = function (low, high) {
                    var nodes = this.Nodes;
                    var enumerator = nodes.GetEnumerator();
                    var totalArea = 0.0;
                    var minArea = Number.POSITIVE_INFINITY;
                    var maxArea = Number.NEGATIVE_INFINITY;
                    while (enumerator.MoveNext()) {
                        minArea = Math.min(minArea, enumerator.Current.Area);
                        maxArea = Math.max(maxArea, enumerator.Current.Area);
                        totalArea += enumerator.Current.Area;
                    }

                    enumerator = nodes.GetEnumerator();
                    while (enumerator.MoveNext()) {
                        var normalized = (enumerator.Current.Area - minArea) / (maxArea - minArea);
                        enumerator.Current.Weight = normalized * (high - low) + low;
                    }
                };
                return TestViewModel;
            })(Fayde.MVVM.ObservableObject);
            ViewModels.TestViewModel = TestViewModel;
            Fayde.RegisterType(TestViewModel, {
                Name: "TestViewModel",
                Namespace: "KineticGraph.Test.ViewModels",
                XmlNamespace: "folder:ViewModels"
            });

            function randomInt(low, high) {
                return Math.floor(Math.random() * (high - low) + low);
            }

            function newGuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        })(Test.ViewModels || (Test.ViewModels = {}));
        var ViewModels = Test.ViewModels;
    })(KineticGraph.Test || (KineticGraph.Test = {}));
    var Test = KineticGraph.Test;
})(KineticGraph || (KineticGraph = {}));
//# sourceMappingURL=TestViewModel.js.map
