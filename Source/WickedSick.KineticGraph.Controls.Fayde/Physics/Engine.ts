/// <reference path="../Fayde.d.ts" />
/// <reference path="../ILinkable.ts" />
/// <reference path="ForceHelper.ts" />

module KineticGraph.Controls.Physics {
    export interface INode {
        Linkable: ILinkable;
        PhysicalState: INodeState;
        Degree: number;
        Radius: number;
    }
    export interface IEdge {
        Source: INode;
        Sink: INode;
    }

    var dT = 0.95;
    var damping = 0.90;
    var KE_THRESHOLD = 0.001;
    var numIterations = 2;

    export class Engine {
        private _KE: number = Number.POSITIVE_INFINITY;

        private _Nodes: INode[] = null;
        private _Edges: IEdge[] = null;

        private _IsGraphStabilized = false;
        private _IsGraphDisturbed = false;

        Repulsion = 300.0;
        SpringTension = 0.9 * 0.001;

        GraphStabilized = new MulticastEvent<EventArgs>();
        GraphStabilizing = new MulticastEvent<EventArgs>();

        Attach(nodes: INode[], edges: IEdge[]) {
            this._Nodes = nodes;
            this._Edges = edges;
        }
        Step() {
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
        }
        ApplyForces() {
            var totalKE = 0.0;
            var nodes = this._Nodes;
            var edges = this._Edges;

            for (var i = 0; i < nodes.length; i++) {
                nodes[i].PhysicalState.Force.X = 0;
                nodes[i].PhysicalState.Force.Y = 0;
            }

            var node: INode;
            for (var i = 0; i < nodes.length; i++) {
                node = nodes[i];
                var state = node.PhysicalState;
                if (state.IsFrozen)
                    continue;

                //Coulomb repulsion against every other node
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
                    ForceHelper.ApplyCoulombRepulsion(state, otherState, repulsion);
                }
            }

            //Hooke's attraction with every connected node
            var tension = this.SpringTension;
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                ForceHelper.ApplyHookeAttraction(edge.Source.PhysicalState, edge.Sink.PhysicalState, tension);
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
        }
        Disturb() {
            this._IsGraphDisturbed = true;
        }
    }
}