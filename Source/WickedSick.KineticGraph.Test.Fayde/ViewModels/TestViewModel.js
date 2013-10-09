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
            var TestNode = (function () {
                function TestNode() {
                    this.UniqueID = newGuid();
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
                };

                TestViewModel.prototype.AddNode_Execute = function () {
                    var newNode = new TestNode();
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

                TestViewModel.prototype.AddState = function () {
                    var connections = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        connections[_i] = arguments[_i + 0];
                    }
                    var node = new TestNode();
                    this.Nodes.Add(node);
                    if (!connections)
                        return node;
                    var len = connections.length;
                    for (var i = 0; i < len; i++) {
                        this.Edges.Add(node.Connect(connections[i]));
                    }
                    return node;
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
