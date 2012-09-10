using System;
using System.Collections.Generic;

namespace WickedSick.KineticGraph.Controls.Physics
{
    internal class Engine
    {
        private double _KE = double.PositiveInfinity;
        private const double KE_THRESHOLD = 0.001;
        //private const double CENTERING_THRESHOLD = 0.3;
        private bool _IsGraphDisturbed;
        private int _NumberOfIterations = 15;

        public bool IsGraphStabilized { get; protected set; }
        public double KineticEnergy { get { return _KE; } }
        public double AverageKineticEnergy { get { return _KE / _Nodes.Count; } }

        private IList<Node> _Nodes;
        private IList<Edge> _Edges;

        public void Attach(IList<Node> nodes, IList<Edge> edges)
        {
            _Nodes = nodes;
            _Edges = edges;
        }

        public void Step()
        {
            if (_Nodes == null)
                return;
            if (_Edges == null)
                return;

            if (KE_THRESHOLD <= AverageKineticEnergy)
            {
                if (IsGraphStabilized)
                {
                    IsGraphStabilized = false;
                    OnGraphStabilizing();
                }
                for (int i = 0; i < _NumberOfIterations; i++)
                {
                    _KE = ApplyForces();
                }
            }
            else if (_IsGraphDisturbed)
            {
                if (IsGraphStabilized)
                {
                    IsGraphStabilized = false;
                    OnGraphStabilizing();
                }
                _KE = ApplyForces();
                _IsGraphDisturbed = false;
            }
            else
            {
                IsGraphStabilized = true;
                OnGraphStabilized();
            }
        }

        private double ApplyForces()
        {
            double totalKE = 0.0;
            const double dT = 0.95;
            const double damping = 0.90;

            const double hookeAttraction = 0.9 * 0.001;

            for (int i = 0; i < _Nodes.Count; i++)
            {
                var state = _Nodes[i].PhysicalState;
                state.Force.X = 0;
                state.Force.Y = 0;
            }

            for (int i = 0; i < _Nodes.Count; i++)
            {
                var node = _Nodes[i];
                var state = node.PhysicalState;

                if (state.IsBeingDragged)
                    continue;

                //Coulomb repulsion against every other node
                for (int j = i + 1; j < _Nodes.Count; j++)
                {
                    var other = _Nodes[j];
                    var otherState = other.PhysicalState;

                    /* Applies coulumb replusion to both nodes
                     * The repulsion constant is modified dynamically based on the node vertex degree.
                     * In a nutshell, lots of connected nodes --> more repulsion.
                     * Increasing repulsion initial value will increase separation of a cluster.
                     */
                    double repulsion = 300.0;
                    repulsion *= Math.Log(other.Degree + 2, 2);

                    ForceHelper.ApplyCoulombRepulsion(state, otherState, repulsion, !otherState.IsBeingDragged);
                }

                /*
                
                //Hooke's attraction with every connected node
                foreach (DirectedEdge edge in node.ChildEdges)
                {
                    
                    NodeState other = NodeStateFromGuid(edge.Sink.ID);
                    if (other == null)
                        continue;
                    ForceHelper.ApplyHookeAttraction(state.Position, other.Position, hookeAttraction, ref state.Force);
                }
                foreach (DirectedEdge edge in node.ParentEdges)
                {
                    NodeState other = NodeStateFromGuid(edge.Source.ID);
                    if (other == null)
                        continue;
                    ForceHelper.ApplyHookeAttraction(state.Position, other.Position, hookeAttraction, ref state.Force);
                }
                
                */

            }
            
            //Hooke's attraction with every connected node
            for (int i = 0; i < _Edges.Count; i++)
            {
                var edge = _Edges[i];
                ForceHelper.ApplyHookeAttraction(edge.Source.PhysicalState, edge.Sink.PhysicalState, hookeAttraction);
            }

            for (int i = 0; i < _Nodes.Count; i++)
            {
                var state = _Nodes[i].PhysicalState;
                // Update velocity
                state.Velocity.X = (state.Force.X * dT + state.Velocity.X) * damping;
                state.Velocity.Y = (state.Force.Y * dT + state.Velocity.Y) * damping;
                // Update KE
                totalKE += (state.Velocity.X * state.Velocity.X) + (state.Velocity.Y * state.Velocity.Y);
                // Update position
                double temp = state.Position.X + state.Velocity.X * dT;
                if (!double.IsNaN(temp))
                    state.Position.X = temp;
                temp = state.Position.Y + state.Velocity.Y * dT;
                if (!double.IsNaN(temp))
                    state.Position.Y = temp;
            }

            return totalKE;
        }

        protected virtual void OnGraphStabilizing()
        {
        }
        protected virtual void OnGraphStabilized()
        {
        }
    }
}