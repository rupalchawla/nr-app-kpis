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
import ManageApps from "../components/ManageApps";

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

function HomeNerdlet() {

  function appAddedCallback() {
    console.log("App added");
  }
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
      <ManageApps callback={appAddedCallback}/>
    </div>
  );
}

export default HomeNerdlet;
