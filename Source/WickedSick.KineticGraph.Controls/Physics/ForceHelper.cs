﻿using System;
using System.Windows;

namespace WickedSick.KineticGraph.Controls.Physics
{
    internal static class ForceHelper
    {
        public const double DEFAULT_ATTRACTION_CONSTANT = 0.00000004;
        private const int MAGNITUDE_MAX = 10;

        static ForceHelper()
        {
            AttractionConstant = DEFAULT_ATTRACTION_CONSTANT;
        }

        public static double AttractionConstant { get; set; }

        /// <summary>
        /// Applies coulomb repulsion to both points
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        /// <param name="k">coefficient of attraction</param>
        /// <param name="f1">Force at point a</param>
        /// <param name="f2">Force at point b</param>
        public static void ApplyCoulombRepulsion(NodeState a, NodeState b, double k)
        {
            double dx = a.Position.X - b.Position.X;
            double dy = a.Position.Y - b.Position.Y;
            double sqDist = dx * dx + dy * dy;
            if (sqDist == 0)
                return;
            double d = Math.Sqrt(sqDist);

            double mag = 1.0 / sqDist; // Force magnitude

            mag -= AttractionConstant * d; // plus WEAK attraction

            mag *= k;

            if (mag > MAGNITUDE_MAX)
                mag = MAGNITUDE_MAX; // Clip maximum

            double tempX = mag * (dx / d);
            double tempY = mag * (dy / d);

            if (!a.IsFrozen)
            {
                a.Force.X += tempX;
                a.Force.Y += tempY;
            }

            if (!b.IsFrozen)
            {
                b.Force.X -= tempX;
                b.Force.Y -= tempY;
            }
        }

        public static void ApplyHookeAttraction(Point a, Point b, double k, ref Point f)
        {
            //double dx = (a.X - b.X);
            //double dy = (a.Y - b.Y);
            //double d = Math.Sqrt(dx * dx + dy * dy);

            //double mag = -k * 0.001 * Math.Pow(d, 1.0); // Force magnitude
            //double mag = -k * 0.001 * d; // Force magnitude

            f.X += -k * (a.X - b.X);
            f.Y += -k * (a.Y - b.Y);
        }

        public static void ApplyHookeAttraction(NodeState a, NodeState b, double k)
        {
            var p1 = a.Position;
            var p2 = b.Position;
            
            var x = -k * (p1.X - p2.X);
            var y = -k * (p1.Y - p2.Y);

            if (!a.IsFrozen)
            {
                a.Force.X += x;
                a.Force.Y += y;
            }

            if (!b.IsFrozen)
            {
                b.Force.X -= x;
                b.Force.Y -= y;
            }
        }
    }
}