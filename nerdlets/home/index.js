import React from "react";
import { regenerateRuntime } from "regenerator-runtime/runtime";
import {
  PlatformStateContext,
  Card,
  CardHeader,
  CardBody,
  Layout,
  LayoutItem,
  Grid,
  GridItem,
  Button,
} from "nr1";
import { timeRangeToNrql } from "@newrelic/nr1-community";
import AddAppsDrawer from "../components/AddAppsDrawer";

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

function HomeNerdlet() {
  return (
    <div>
      <PlatformStateContext.Consumer>
        {(platformState) => {
          /* Taking a peek at the platformState */
          console.log(platformState);
          const since = timeRangeToNrql(platformState);
          console.log(since);
        }}
      </PlatformStateContext.Consumer>
      <AddAppsDrawer />
    </div>
  );
}

export default HomeNerdlet;
