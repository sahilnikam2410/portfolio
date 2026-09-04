'use client';

import { Component } from 'react';

/**
 * The scene is decoration; the content is the point.
 *
 * A shader that fails to compile on an unusual driver, or a WebGL context that
 * cannot be created at all, would otherwise take the whole page down with it.
 * This catches that and renders the static grid instead, so the portfolio
 * still reads on hardware that cannot run it.
 */
export default class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[scene] disabled after an error:', error?.message ?? error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 grid-lines opacity-40" />
        </div>
      );
    }
    return this.props.children;
  }
}
