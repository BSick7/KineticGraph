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
