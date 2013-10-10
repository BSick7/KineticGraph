var KineticGraph;
(function (KineticGraph) {
    (function (Controls) {
        (function (Physics) {
            var DEFAULT_ATTRACTION_CONSTANT = 0.000000004;
            var MAGNITUDE_MAX = 10;
            var ForceHelper = (function () {
                function ForceHelper() {
                }
                ForceHelper.ApplyCoulombRepulsion = /// Applies coulomb repulsion to both points
                function (a, b, k) {
                    var dx = a.Position.X - b.Position.X;
                    var dy = a.Position.Y - b.Position.Y;
                    var sqDist = dx * dx + dy * dy;
                    if (sqDist == 0)
                        return;
                    var d = Math.sqrt(sqDist);

                    var mag = 1.0 / sqDist;

                    mag -= ForceHelper.AttractionConstant * d;

                    mag *= k;

                    if (mag > MAGNITUDE_MAX)
                        mag = MAGNITUDE_MAX;

                    var tempX = mag * (dx / d);
                    var tempY = mag * (dy / d);

                    if (!a.IsFrozen) {
                        a.Force.X += tempX;
                        a.Force.Y += tempY;
                    }

                    if (!b.IsFrozen) {
                        b.Force.X -= tempX;
                        b.Force.Y -= tempY;
                    }
                };
                ForceHelper.ApplyHookeAttraction = function (a, b, k) {
                    var p1 = a.Position;
                    var p2 = b.Position;

                    var x = -k * (p1.X - p2.X);
                    var y = -k * (p1.Y - p2.Y);

                    if (!a.IsFrozen) {
                        a.Force.X += x;
                        a.Force.Y += y;
                    }

                    if (!b.IsFrozen) {
                        b.Force.X -= x;
                        b.Force.Y -= y;
                    }
                };
                ForceHelper.AttractionConstant = DEFAULT_ATTRACTION_CONSTANT;
                return ForceHelper;
            })();
            Physics.ForceHelper = ForceHelper;
        })(Controls.Physics || (Controls.Physics = {}));
        var Physics = Controls.Physics;
    })(KineticGraph.Controls || (KineticGraph.Controls = {}));
    var Controls = KineticGraph.Controls;
})(KineticGraph || (KineticGraph = {}));
var KineticGraph;
(function (KineticGraph) {
    (function (Controls) {
        /// <reference path="../Fayde.d.ts" />
        /// <reference path="../ILinkable.ts" />
        /// <reference path="ForceHelper.ts" />
        (function (Physics) {
            var dT = 0.95;
            var damping = 0.90;
            var KE_THRESHOLD = 0.001;
            var numIterations = 2;

            var Engine = (function () {
                function Engine() {
                    this._KE = Number.POSITIVE_INFINITY;
                    this._Nodes = null;
                    this._Edges = null;
                    this._IsGraphStabilized = false;
                    this._IsGraphDisturbed = false;
                    this.Repulsion = 300.0;
                    this.SpringTension = 0.9 * 0.001;
                    this.GraphStabilized = new MulticastEvent();
                    this.GraphStabilizing = new MulticastEvent();
                }
                Engine.prototype.Attach = function (nodes, edges) {
                    this._Nodes = nodes;
                    this._Edges = edges;
                };
                Engine.prototype.Step = function () {
                    if (this._Nodes == null)
                        return;
                    if (this._Edges == null)
                        return;

                    var avgKE = this._KE / this._Nodes.length;
                    if (KE_THRESHOLD <= avgKE) {
                        if (this._IsGraphStabilized) {
                            this._IsGraphStabilized = false;
                            this.GraphStabilizing.Raise(this, EventArgs.Empty);
                        }
                        for (var i = 0; i < numIterations; i++) {
                            this._KE = this.ApplyForces();
                        }
                    } else if (this._IsGraphDisturbed) {
                        if (this._IsGraphStabilized) {
                            this._IsGraphStabilized = false;
                            this.GraphStabilizing.Raise(this, EventArgs.Empty);
                        }
                        this._KE = this.ApplyForces();
                        this._IsGraphDisturbed = false;
                    } else if (!this._IsGraphStabilized) {
                        this._IsGraphStabilized = true;
                        this.GraphStabilized.Raise(this, EventArgs.Empty);
                    }
                };
                Engine.prototype.ApplyForces = function () {
                    var totalKE = 0.0;
                    var nodes = this._Nodes;
                    var edges = this._Edges;

                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].PhysicalState.Force.X = 0;
                        nodes[i].PhysicalState.Force.Y = 0;
                    }

                    var node;
                    for (var i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        var state = node.PhysicalState;
                        if (state.IsFrozen)
                            continue;

                        for (var j = i + 1; j < nodes.length; j++) {
                            var other = nodes[j];
                            var otherState = other.PhysicalState;

                            /* Applies coulumb replusion to both nodes
                            * The repulsion constant is modified dynamically based on the node vertex degree.
                            * In a nutshell, lots of connected nodes --> more repulsion.
                            * Increasing repulsion initial value will increase separation of a cluster.
                            */
                            var log2degree = Math.log(other.Degree + 2) / Math.log(2);
                            var repulsion = this.Repulsion * log2degree;
                            repulsion *= (node.Radius + other.Radius) / 10.0;
                            Physics.ForceHelper.ApplyCoulombRepulsion(state, otherState, repulsion);
                        }
                    }

                    //Hooke's attraction with every connected node
                    var tension = this.SpringTension;
                    for (var i = 0; i < edges.length; i++) {
                        var edge = edges[i];
                        Physics.ForceHelper.ApplyHookeAttraction(edge.Source.PhysicalState, edge.Sink.PhysicalState, tension);
                    }

                    for (var i = 0; i < nodes.length; i++) {
                        var state = nodes[i].PhysicalState;
                        if (state.IsFrozen)
                            continue;

                        // Update velocity
                        state.Velocity.X = (state.Force.X * dT + state.Velocity.X) * damping;
                        state.Velocity.Y = (state.Force.Y * dT + state.Velocity.Y) * damping;

                        // Update KE
                        totalKE += (state.Velocity.X * state.Velocity.X) + (state.Velocity.Y * state.Velocity.Y);

                        // Update position
                        var temp = state.Position.X + state.Velocity.X * dT;
                        if (!isNaN(temp))
                            state.Position.X = temp;
                        temp = state.Position.Y + state.Velocity.Y * dT;
                        if (!isNaN(temp))
                            state.Position.Y = temp;
                    }

                    return totalKE;
                };
                Engine.prototype.Disturb = function () {
                    this._IsGraphDisturbed = true;
                };
                return Engine;
            })();
            Physics.Engine = Engine;
        })(Controls.Physics || (Controls.Physics = {}));
        var Physics = Controls.Physics;
    })(KineticGraph.Controls || (KineticGraph.Controls = {}));
    var Controls = KineticGraph.Controls;
})(KineticGraph || (KineticGraph = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KineticGraph;
(function (KineticGraph) {
    /// <reference path="Fayde.d.ts" />
    /// <reference path="Physics/Engine.ts" />
    /// CODE
    /// <reference path="Graph.ts" />
    (function (Controls) {
        var NodeState = (function () {
            function NodeState() {
                this.Position = { X: 0.0, Y: 0.0 };
                this.Velocity = { X: 0.0, Y: 0.0 };
                this.Force = { X: 0.0, Y: 0.0 };
                this.IsFrozen = false;
            }
            return NodeState;
        })();

        var NodeCanvas = (function (_super) {
            __extends(NodeCanvas, _super);
            function NodeCanvas() {
                _super.call(this);
                this._Linkable = null;
                this.Degree = 0.0;
                this.Graph = null;
                this._Circle = new Fayde.Shapes.Ellipse();
                this._TextBlock = new Fayde.Controls.TextBlock();
                this.ManualMovement = new MulticastEvent();
                this._LastPos = null;
                this._IsDragging = false;

                this.PhysicalState = new NodeState();

                this.MouseLeftButtonDown.Subscribe(this.Node_MouseLeftButtonDown, this);
                this.MouseLeftButtonUp.Subscribe(this.Node_MouseLeftButtonUp, this);
                this.MouseMove.Subscribe(this.Node_MouseMove, this);
                this.LostMouseCapture.Subscribe(this.Node_LostMouseCapture, this);

                var circle = this._Circle;
                circle.Fill = new Fayde.Media.SolidColorBrush(Color.FromRgba(128, 128, 128, 0.5));
                circle.Stroke = new Fayde.Media.SolidColorBrush(Color.FromRgba(128, 128, 128, 1.0));
                circle.StrokeThickness = 2.0;
                this.Children.Add(circle);

                var tb = this._TextBlock;
                tb.SetBinding(Fayde.Controls.TextBlock.TextProperty, new Fayde.Data.Binding(""));
                tb.SizeChanged.Subscribe(this.TextBlock_SizeChanged, this);
                this.Children.Add(tb);
            }
            Object.defineProperty(NodeCanvas.prototype, "Linkable", {
                get: function () {
                    return this._Linkable;
                },
                set: function (value) {
                    this._Linkable = value;
                    this.DataContext = value;
                },
                enumerable: true,
                configurable: true
            });

            NodeCanvas.prototype.OnIsSelectedChanged = function (args) {
                if (args.OldValue === args.NewValue)
                    return;

                if (args.NewValue === true) {
                    console.log("Highlight me!");
                } else {
                    console.log("Unhighlight me!");
                }

                if (this.Graph != null)
                    this.Graph.SetCurrentValue(Controls.Graph.SelectedNodeProperty, this);
            };

            NodeCanvas.prototype.OnRadiusChanged = function (args) {
                var radius = args.NewValue;
                this.UpdateMarkers();
            };

            NodeCanvas.prototype.UpdatePosition = function () {
                Fayde.Controls.Canvas.SetLeft(this, this.PhysicalState.Position.X - (this._Circle.ActualWidth / 2));
                Fayde.Controls.Canvas.SetTop(this, this.PhysicalState.Position.Y - (this._Circle.ActualHeight / 2));
            };

            NodeCanvas.prototype.SetDisplayMemberPath = function (path) {
                this._TextBlock.SetBinding(Fayde.Controls.TextBlock.TextProperty, new Fayde.Data.Binding(path));
            };

            NodeCanvas.prototype.TextBlock_SizeChanged = function (sender, e) {
                this.UpdateMarkers();
            };
            NodeCanvas.prototype.UpdateMarkers = function () {
                var radius = this.Radius;
                this._Circle.Width = 2 * radius;
                this._Circle.Height = 2 * radius;

                var tbw = this._TextBlock.ActualWidth;
                var tbh = this._TextBlock.ActualHeight;
                this._TextBlock.SetValue(Fayde.Controls.Canvas.LeftProperty, radius - tbw / 2.0);
                this._TextBlock.SetValue(Fayde.Controls.Canvas.TopProperty, radius - tbh / 2.0);
            };

            NodeCanvas.prototype.Node_MouseLeftButtonDown = function (sender, e) {
                if (e.Handled)
                    return;
                e.Handled = this.PhysicalState.IsFrozen = this._IsDragging = this.CaptureMouse();
                this._LastPos = e.GetPosition(this.VisualParent);
            };
            NodeCanvas.prototype.Node_MouseLeftButtonUp = function (sender, e) {
                this.ReleaseMouseCapture();
            };
            NodeCanvas.prototype.Node_MouseMove = function (sender, e) {
                if (this._IsDragging) {
                    var curPos = e.GetPosition(this.VisualParent);
                    var delta = new Point(curPos.X - this._LastPos.X, curPos.Y - this._LastPos.Y);
                    this.PhysicalState.Position.X += delta.X;
                    this.PhysicalState.Position.Y += delta.Y;
                    this._LastPos = curPos;
                }
            };
            NodeCanvas.prototype.Node_LostMouseCapture = function (sender, e) {
                this.PhysicalState.IsFrozen = false;
                this._IsDragging = false;
                this.ManualMovement.Raise(this, EventArgs.Empty);
            };
            NodeCanvas.IsSelectedProperty = DependencyProperty.Register("IsSelected", function () {
                return Boolean;
            }, NodeCanvas, false, function (d, args) {
                return (d).OnIsSelectedChanged(args);
            });

            NodeCanvas.RadiusProperty = DependencyProperty.Register("Radius", function () {
                return Number;
            }, NodeCanvas, 15.0, function (d, args) {
                return (d).OnRadiusChanged(args);
            });
            return NodeCanvas;
        })(Fayde.Controls.Canvas);
        Controls.NodeCanvas = NodeCanvas;
        Fayde.RegisterType(NodeCanvas, {
            Name: "NodeCanvas",
            Namespace: "KineticGraph.Controls"
        });
    })(KineticGraph.Controls || (KineticGraph.Controls = {}));
    var Controls = KineticGraph.Controls;
})(KineticGraph || (KineticGraph = {}));
var KineticGraph;
(function (KineticGraph) {
    /// <reference path="Fayde.d.ts" />
    /// <reference path="Physics/Engine.ts" />
    (function (Controls) {
        var EdgeCanvas = (function (_super) {
            __extends(EdgeCanvas, _super);
            function EdgeCanvas() {
                _super.call(this);
                this._IsBidirectional = false;

                this.IsHitTestVisible = false;

                this.Children.Add(this._Line = buildLine());
                this.Children.Add(this._Triangle = buildTriangle(5, 9));
                this._Triangle.Visibility = this.IsBidirectional === true ? Fayde.Visibility.Visible : Fayde.Visibility.Collapsed;
            }
            Object.defineProperty(EdgeCanvas.prototype, "IsBidirectional", {
                get: function () {
                    return this._IsBidirectional;
                },
                set: function (value) {
                    this._IsBidirectional = value;
                    this._Triangle.Visibility = value === true ? Fayde.Visibility.Visible : Fayde.Visibility.Collapsed;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(EdgeCanvas.prototype, "Left", {
                get: function () {
                    return this.GetValue(Fayde.Controls.Canvas.LeftProperty);
                },
                set: function (value) {
                    this.SetValue(Fayde.Controls.Canvas.LeftProperty, value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(EdgeCanvas.prototype, "Top", {
                get: function () {
                    return this.GetValue(Fayde.Controls.Canvas.TopProperty);
                },
                set: function (value) {
                    this.SetValue(Fayde.Controls.Canvas.TopProperty, value);
                },
                enumerable: true,
                configurable: true
            });

            EdgeCanvas.prototype.UpdatePosition = function () {
                var source = this.Source;
                var sink = this.Sink;

                var a = source == null ? { X: 0, Y: 0 } : source.PhysicalState.Position;
                var b = sink == null ? { X: 0, Y: 0 } : sink.PhysicalState.Position;

                var theta = getLineAngle(a, b);
                if (isNaN(theta))
                    return;
                var thetaRad = theta * (Math.PI / 180);

                //double thetaRev = thetaRad - (Math.PI*2.0);
                var sp = source == null ? a : getEdgeOfCircle(a, thetaRad, source.Radius, true);
                var ep = sink == null ? b : getEdgeOfCircle(b, thetaRad, sink.Radius, false);

                var x1 = Math.min(sp.X, ep.X);
                var x2 = Math.max(sp.X, ep.X);
                var y1 = Math.min(sp.Y, ep.Y);
                var y2 = Math.max(sp.Y, ep.Y);

                //Define boundaries
                this.Left = x1;
                this.Top = y1;
                this.Width = x2 - x1;
                this.Height = y2 - y1;

                //Place line link on the correct corners of canvas
                this._Line.X1 = ep.X > sp.X ? 0 : this.Width;
                this._Line.Y1 = ep.Y > sp.Y ? 0 : this.Height;
                this._Line.X2 = ep.X > sp.X ? this.Width : 0;
                this._Line.Y2 = ep.Y > sp.Y ? this.Height : 0;

                //Rotate the arrow then move it to the desired position
                var tg = new Fayde.Media.TransformGroup();

                var rt = new Fayde.Media.RotateTransform();
                rt.Angle = theta;
                rt.CenterX = this._Triangle.Width / 2;
                rt.CenterY = this._Triangle.Height / 2;
                tg.Children.Add(rt);

                var tt = new Fayde.Media.TranslateTransform();
                tt.X = this.Width / 2 - this._Triangle.Width / 2;
                tt.Y = this.Height / 2 - this._Triangle.Height / 2;
                tg.Children.Add(tt);

                this._Triangle.RenderTransform = tg;
            };
            return EdgeCanvas;
        })(Fayde.Controls.Canvas);
        Controls.EdgeCanvas = EdgeCanvas;
        Fayde.RegisterType(EdgeCanvas, {
            Name: "EdgeCanvas",
            Namespace: "KineticGraph.Controls"
        });

        function buildLine() {
            var line = new Fayde.Shapes.Line();
            line.StrokeThickness = 1.0;
            var stroke = new Fayde.Media.SolidColorBrush();
            stroke.Color = Color.KnownColors.Black;
            line.Stroke = stroke;
            return line;
        }
        function buildTriangle(width, height) {
            var p = new Fayde.Shapes.Polygon();
            p.Width = width;
            p.Height = height;
            var fill = new Fayde.Media.SolidColorBrush();
            fill.Color = Color.KnownColors.Black;
            p.Fill = fill;
            p.Points.Add(new Point(0, 0));
            p.Points.Add(new Point(width, height / 2));
            p.Points.Add(new Point(0, height));
            return p;
        }
        function getLineAngle(a, b) {
            var xDist = Math.abs(a.X - b.X);
            var yDist = Math.abs(a.Y - b.Y);
            var theta = Math.atan(yDist / xDist);
            theta *= 180 / Math.PI;

            if (b.Y > a.Y)
                return b.X >= a.X ? theta : 180 - theta;
            return b.X < a.X ? 180 + theta : 360 - theta;
        }
        function getEdgeOfCircle(p, theta, radius, start) {
            var tempX = p.X;
            var tempY = p.Y;
            tempX += Math.cos(theta) * radius * (start ? 1 : -1);
            tempY += Math.sin(theta) * radius * (start ? 1 : -1);
            return { X: tempX, Y: tempY };
        }
    })(KineticGraph.Controls || (KineticGraph.Controls = {}));
    var Controls = KineticGraph.Controls;
})(KineticGraph || (KineticGraph = {}));
var KineticGraph;
(function (KineticGraph) {
    /// <reference path="Fayde.d.ts" />
    /// <reference path="Physics/Engine.ts" />
    /// <reference path="NodeCanvas.ts" />
    /// <reference path="EdgeCanvas.ts" />
    /// <reference path="ILinkable.ts" />
    /// <reference path="ILinkableEdge.ts" />
    (function (Controls) {
        var MAX_FPS = 100;
        var MAX_MSPF = 1000 / MAX_FPS;

        var MIN_ALLOWED_REPULSION = 10.0;
        var MIN_ALLOWED_SPRING_TENSION = 0.0001;

        var Graph = (function (_super) {
            __extends(Graph, _super);
            function Graph() {
                _super.call(this);
                this._Engine = new Controls.Physics.Engine();
                this.Nodes = [];
                this.Edges = [];
                this._LastPos = null;
                this._IsDragging = false;
                this._LastVisualTick = new Date(0).getTime();

                this._Engine.Attach(this.Nodes, this.Edges);

                this.ResetMovement();

                var bg = new Fayde.Media.SolidColorBrush();
                bg.Color = Color.KnownColors.Transparent;
                this.Background = bg;

                this.MouseLeftButtonDown.Subscribe(this.Graph_MouseLeftButtonDown, this);
                this.MouseLeftButtonUp.Subscribe(this.Graph_MouseLeftButtonUp, this);
                this.MouseMove.Subscribe(this.Graph_MouseMove, this);
                this.LostMouseCapture.Subscribe(this.Graph_LostMouseCapture, this);
                this.SizeChanged.Subscribe(this.Graph_SizeChanged, this);

                this._Timer = new Fayde.ClockTimer();
                this._Timer.RegisterTimer(this);
            }
            Graph.prototype.OnIsBidirectionalChanged = function (args) {
                var isb = args.NewValue === true;
                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Edges);
                while (enumerator.MoveNext()) {
                    enumerator.Current.IsBidirectional = isb;
                }
            };

            Graph.prototype.OnSelectedNodeChanged = function (args) {
                var oldNode = args.OldValue;
                if (oldNode != null && oldNode.IsSelected)
                    oldNode.SetCurrentValue(Controls.NodeCanvas.IsSelectedProperty, false);
            };

            Graph.prototype.OnNodesSourceChanged = function (args) {
                var oldNC = args.OldValue;
                if (Nullstone.ImplementsInterface(oldNC, Fayde.Collections.INotifyCollectionChanged_))
                    oldNC.CollectionChanged.Unsubscribe(this.NodesSource_CollectionChanged, this);
                this.RemoveNodes(args.OldValue);

                var newNC = args.NewValue;
                this.AddNodes(args.NewValue);
                if (Nullstone.ImplementsInterface(newNC, Fayde.Collections.INotifyCollectionChanged_))
                    newNC.CollectionChanged.Subscribe(this.NodesSource_CollectionChanged, this);
            };
            Graph.prototype.NodesSource_CollectionChanged = function (sender, e) {
                switch (e.Action) {
                    case Fayde.Collections.NotifyCollectionChangedAction.Add:
                        this.AddNodes(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Remove:
                        this.RemoveNodes(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Reset:
                        this.ClearNodes();
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Replace:
                        this.AddNodes(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                        this.RemoveNodes(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                        break;
                }
            };

            Graph.prototype.OnEdgesSourceChanged = function (args) {
                var oldNC = args.OldValue;
                if (Nullstone.ImplementsInterface(oldNC, Fayde.Collections.INotifyCollectionChanged_))
                    oldNC.CollectionChanged.Unsubscribe(this.EdgesSource_CollectionChanged, this);
                this.RemoveNodes(args.OldValue);

                var newNC = args.NewValue;
                this.AddEdges(args.NewValue);
                if (Nullstone.ImplementsInterface(newNC, Fayde.Collections.INotifyCollectionChanged_))
                    newNC.CollectionChanged.Subscribe(this.EdgesSource_CollectionChanged, this);
            };
            Graph.prototype.EdgesSource_CollectionChanged = function (sender, e) {
                switch (e.Action) {
                    case Fayde.Collections.NotifyCollectionChangedAction.Add:
                        this.AddEdges(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Remove:
                        this.RemoveEdges(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Reset:
                        this.ClearEdges();
                        break;
                    case Fayde.Collections.NotifyCollectionChangedAction.Replace:
                        this.AddEdges(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                        this.RemoveEdges(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                        break;
                }
            };

            Graph.prototype.OnRepulsionChanged = function (args) {
                if (args.NewValue < MIN_ALLOWED_REPULSION)
                    throw new ArgumentOutOfRangeException("Repulsion");
                this._Engine.Repulsion = args.NewValue;
                this._Engine.Disturb();
            };

            Graph.prototype.OnSpringTensionChanged = function (args) {
                if (args.NewValue < MIN_ALLOWED_SPRING_TENSION)
                    throw new ArgumentOutOfRangeException("SpringTension");
                this._Engine.SpringTension = args.NewValue;
                this._Engine.Disturb();
            };

            Graph.prototype.OnNodeDisplayMemberPathChanged = function (args) {
                var path = args.NewValue || "";
                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
                while (enumerator.MoveNext()) {
                    enumerator.Current.SetDisplayMemberPath(path);
                }
            };

            Graph.prototype.OnNodeWeightPathChanged = function (args) {
                var path = args.NewValue || "";
                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
                while (enumerator.MoveNext()) {
                    this.SetNodeWeightPath(enumerator.Current, path);
                }
            };
            Graph.prototype.SetNodeWeightPath = function (nodeCanvas, path) {
                if (!path)
                    return nodeCanvas.ClearValue(Controls.NodeCanvas.RadiusProperty);
                nodeCanvas.SetBinding(Controls.NodeCanvas.RadiusProperty, new Fayde.Data.Binding(path));
            };

            Graph.prototype.OnTicked = function (lastTime, nowTime) {
                this._Engine.Step();
                this.UpdateVisuals();
            };

            Graph.prototype.Graph_MouseLeftButtonDown = function (sender, e) {
                if (e.Handled)
                    return;
                e.Handled = this._IsDragging = this.CaptureMouse();
                this._LastPos = e.GetPosition(this);
            };
            Graph.prototype.Graph_MouseMove = function (sender, e) {
                if (this._IsDragging) {
                    var curPos = e.GetPosition(this);
                    var delta = new Point(curPos.X - this._LastPos.X, curPos.Y - this._LastPos.Y);
                    this._CanvasTranslate.X += delta.X;
                    this._CanvasTranslate.Y += delta.Y;
                    this._LastPos = curPos;
                }
            };
            Graph.prototype.Graph_MouseLeftButtonUp = function (sender, e) {
                this.ReleaseMouseCapture();
            };
            Graph.prototype.Graph_LostMouseCapture = function (sender, e) {
                this._IsDragging = false;
            };
            Graph.prototype.Graph_SizeChanged = function (sender, e) {
                var dw = e.NewSize.Width - e.PreviousSize.Width;
                var dh = e.NewSize.Height - e.PreviousSize.Height;
                this._CanvasTranslate.X += dw / 2.0;
                this._CanvasTranslate.Y += dh / 2.0;
            };

            Graph.prototype.ResetMovement = function () {
                var tg = new Fayde.Media.TransformGroup();
                tg.Children.Add(this._CanvasScale = new Fayde.Media.ScaleTransform());
                tg.Children.Add(this._CanvasTranslate = new Fayde.Media.TranslateTransform());
                this.RenderTransform = tg;
            };
            Graph.prototype.Center = function () {
                var nodes = this.Nodes;
                var count = nodes.length;
                var totX = 0.0;
                var totY = 0.0;

                var enumerator = Fayde.ArrayEx.GetEnumerator(nodes);
                var node;
                while (enumerator.MoveNext()) {
                    node = enumerator.Current;
                    totX += node.PhysicalState.Position.X;
                    totY += node.PhysicalState.Position.Y;
                }
                this._CanvasTranslate.X = (this.ActualWidth / 2) - (totX / count);
                this._CanvasTranslate.Y = (this.ActualHeight / 2) - (totY / count);
            };

            Graph.prototype.UpdateVisuals = function () {
                var now = new Date().getTime();
                if (now - this._LastVisualTick < MAX_MSPF)
                    return;
                this._LastVisualTick = now;

                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
                while (enumerator.MoveNext()) {
                    enumerator.Current.UpdatePosition();
                }

                var enumerator2 = Fayde.ArrayEx.GetEnumerator(this.Edges);
                while (enumerator2.MoveNext()) {
                    enumerator2.Current.UpdatePosition();
                }
            };

            Graph.prototype.AddEdges = function (newEdges) {
                if (!newEdges)
                    return;
                var enumerator = newEdges.GetEnumerator();
                while (enumerator.MoveNext()) {
                    this.FindOrAddEdge(enumerator.Current);
                }
            };
            Graph.prototype.FindOrAddEdge = function (newEdge) {
                var index = this.FindEdgeIndex(newEdge);
                if (index > -1)
                    return this.Edges[index];
                return this.AddEdge(newEdge);
            };
            Graph.prototype.AddEdge = function (gedge) {
                var edge = new Controls.EdgeCanvas();
                edge.Source = this.FindOrAddNode(gedge.Source);
                edge.Sink = this.FindOrAddNode(gedge.Sink);
                if (edge.Source.Linkable.UniqueID === edge.Sink.Linkable.UniqueID)
                    return null;
                this.Edges.push(edge);
                edge.Sink.Degree++;
                edge.Source.Degree++;
                this.Children.Add(edge);
                this._Engine.Disturb();
                return edge;
            };
            Graph.prototype.RemoveEdges = function (oldEdges) {
                if (!oldEdges)
                    return;
                var enumerator = oldEdges.GetEnumerator();
                while (enumerator.MoveNext()) {
                    this.RemoveEdge(enumerator.Current);
                }
            };
            Graph.prototype.RemoveEdge = function (edge) {
                var index = this.FindEdgeIndex(edge);
                if (index < 0)
                    return;
                var existing = this.Edges.splice(index, 1)[0];
                this.Children.Remove(existing);
                existing.Sink.Degree--;
                existing.Source.Degree--;
                this._Engine.Disturb();
            };
            Graph.prototype.ClearEdges = function () {
                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Edges);
                while (enumerator.MoveNext()) {
                    this.Children.Remove(enumerator.Current);
                }
                this.Edges = [];
                this._Engine.Disturb();
            };
            Graph.prototype.FindEdgeIndex = function (edge) {
                var edges = this.Edges;
                var len = edges.length;
                var e;
                for (var i = 0; i < len; i++) {
                    e = edges[i];
                    if (e.Source.Linkable.UniqueID === edge.Source.UniqueID && e.Sink.Linkable.UniqueID === edge.Sink.UniqueID)
                        return i;
                }
                return -1;
            };

            Graph.prototype.AddNodes = function (newLinkables) {
                if (!newLinkables)
                    return;
                var enumerator = newLinkables.GetEnumerator();
                while (enumerator.MoveNext()) {
                    this.FindOrAddNode(enumerator.Current);
                }
            };
            Graph.prototype.FindOrAddNode = function (linkable) {
                var index = this.FindNodeIndex(linkable);
                if (index > -1)
                    return this.Nodes[index];
                return this.AddNode(linkable);
            };
            Graph.prototype.AddNode = function (newLinkable) {
                var node = new Controls.NodeCanvas();
                node.Linkable = newLinkable;
                node.Graph = this;
                this.Nodes.push(node);
                this.Children.Add(node);
                node.ManualMovement.Subscribe(this.Node_ManualMovement, this);
                node.PhysicalState.Position = this._GetRandomVector();
                node.SetDisplayMemberPath(this.NodeDisplayMemberPath);
                this.SetNodeWeightPath(node, this.NodeWeightPath);
                this._Engine.Disturb();
                return node;
            };
            Graph.prototype.RemoveNodes = function (oldLinkables) {
                if (!oldLinkables)
                    return;
                var enumerator = oldLinkables.GetEnumerator();
                while (enumerator.MoveNext()) {
                    this.RemoveNode(enumerator.Current);
                }
            };
            Graph.prototype.RemoveNode = function (oldLinkable) {
                var index = this.FindNodeIndex(oldLinkable);
                if (index < 0)
                    return;
                var existing = this.Nodes.splice(index, 1)[0];
                existing.ManualMovement.Unsubscribe(this.Node_ManualMovement, this);
                existing.Graph = null;
                this.Children.Remove(existing);
                this._Engine.Disturb();
            };
            Graph.prototype.ClearNodes = function () {
                var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
                var node;
                while (enumerator.MoveNext()) {
                    node = enumerator.Current;
                    node.ManualMovement.Unsubscribe(this.Node_ManualMovement, this);
                    node.Graph = null;
                    this.Children.Remove(node);
                }
                this.Nodes = [];
                this._Engine.Disturb();
            };
            Graph.prototype.FindNodeIndex = function (linkable) {
                var nodes = this.Nodes;
                var len = nodes.length;
                for (var i = 0; i < len; i++) {
                    if (nodes[i].Linkable.UniqueID === linkable.UniqueID)
                        return i;
                }
                return -1;
            };
            Graph.prototype.Node_ManualMovement = function (sender, e) {
                this._Engine.Disturb();
            };

            Graph.prototype._GetRandomVector = function () {
                var width = this.ActualWidth;
                if (width <= 0)
                    width = 100;
                var height = this.ActualHeight;
                if (height <= 0)
                    height = 100;
                return { X: randomInt(0, width), Y: randomInt(0, height) };
            };
            Graph.IsBidirectionalProperty = DependencyProperty.Register("IsBidirectional", function () {
                return Boolean;
            }, Graph, false, function (d, args) {
                return (d).OnIsBidirectionalChanged(args);
            });

            Graph.SelectedNodeProperty = DependencyProperty.Register("SelectedNode", function () {
                return Controls.NodeCanvas;
            }, Graph, undefined, function (d, args) {
                return (d).OnSelectedNodeChanged(args);
            });

            Graph.NodesSourceProperty = DependencyProperty.Register("NodesSource", function () {
                return Fayde.IEnumerable_;
            }, Graph, undefined, function (d, args) {
                return (d).OnNodesSourceChanged(args);
            });

            Graph.EdgesSourceProperty = DependencyProperty.Register("EdgesSource", function () {
                return Fayde.IEnumerable_;
            }, Graph, undefined, function (d, args) {
                return (d).OnEdgesSourceChanged(args);
            });

            Graph.RepulsionProperty = DependencyProperty.Register("Repulsion", function () {
                return Number;
            }, Graph, 300.0, function (d, args) {
                return (d).OnRepulsionChanged(args);
            });

            Graph.SpringTensionProperty = DependencyProperty.Register("SpringTension", function () {
                return Number;
            }, Graph, 0.0009, function (d, args) {
                return (d).OnSpringTensionChanged(args);
            });

            Graph.NodeDisplayMemberPathProperty = DependencyProperty.Register("NodeDisplayMemberPath", function () {
                return String;
            }, Graph, undefined, function (d, args) {
                return (d).OnNodeDisplayMemberPathChanged(args);
            });

            Graph.NodeWeightPathProperty = DependencyProperty.Register("NodeWeightPath", function () {
                return String;
            }, Graph, undefined, function (d, args) {
                return (d).OnNodeWeightPathChanged(args);
            });
            return Graph;
        })(Fayde.Controls.Canvas);
        Controls.Graph = Graph;
        Fayde.RegisterType(Graph, {
            Name: "Graph",
            Namespace: "KineticGraph.Controls",
            XmlNamespace: "http://schemas.wsick.com/kineticgraph"
        });

        function randomInt(low, high) {
            return Math.floor(Math.random() * (high - low) + low);
        }
    })(KineticGraph.Controls || (KineticGraph.Controls = {}));
    var Controls = KineticGraph.Controls;
})(KineticGraph || (KineticGraph = {}));
//# sourceMappingURL=KineticGraph.js.map
