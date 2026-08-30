"use client";

import Link from "next/link";
import { motion } from "motion/react";

// Created once at module scope (not inside a component body) so it's a
// stable component reference across renders — recreating it per-render
// would remount the link on every parent re-render.
export const MotionLink = motion.create(Link);
