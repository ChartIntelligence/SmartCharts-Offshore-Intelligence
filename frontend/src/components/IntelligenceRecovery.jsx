import { Component } from "react";

// Presentation failure only: never changes evaluation or selected opportunity.
class IntelligenceRecovery extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (this.state.failed && (
      previous.narrative !== this.props.narrative ||
      previous.opportunityState !== this.props.opportunityState
    )) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="opportunity-intelligence" role="alert">
        <h2>Opportunity Intelligence could not be displayed</h2>
        <p>The analysis display failed. This does not establish an evaluation result.</p>
        <button type="button" onClick={() => this.setState({ failed: false })}>Retry Intelligence</button>
        <button type="button" onClick={this.props.onHome}>Home</button>
        <button type="button" onClick={this.props.onMap}>Map</button>
      </section>
    );
  }
}

export default IntelligenceRecovery;
