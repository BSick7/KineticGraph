module KineticGraph.Controls.Physics {
    export interface IVector {
        X: number;
        Y: number;
    }
    export interface INodeState {
        IsFrozen: boolean;
        Position: IVector;
        Velocity: IVector;
        Force: IVector;
    }

    var DEFAULT_ATTRACTION_CONSTANT = 0.000000004;
    var MAGNITUDE_MAX = 10;
    export class ForceHelper {
        static AttractionConstant: number = DEFAULT_ATTRACTION_CONSTANT;
        /// Applies coulomb repulsion to both points
        static ApplyCoulombRepulsion(a: INodeState, b: INodeState, k: number) {
            var dx = a.Position.X - b.Position.X;
            var dy = a.Position.Y - b.Position.Y;
            var sqDist = dx * dx + dy * dy;
            if (sqDist == 0)
                return;
            var d = Math.sqrt(sqDist);

            var mag = 1.0 / sqDist; // Force magnitude

            mag -= ForceHelper.AttractionConstant * d; // plus WEAK attraction

            mag *= k;

            if (mag > MAGNITUDE_MAX)
                mag = MAGNITUDE_MAX; // Clip maximum

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
        }
        static ApplyHookeAttraction(a: INodeState, b: INodeState, k: number) {
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
        }
    }
}