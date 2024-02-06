import React from "react";
import { AutoSizer, Layout, LayoutItem, Button, HeadingText } from "nr1";

function AddAppsDrawer() {
  const [hideDrawer, setHideDrawer] = React.useState(true);
  const [mountDrawer, setMountDrawer] = React.useState(false);

  function openEditDrawer() {
    setHideDrawer(false);
    setMountDrawer(true);
  }

  const onClose = () => {
    setHideDrawer(true);
  };

  const onHideEnd = () => {
    setMountDrawer(false);
  };

  return (
    <div>
      {/* Layout that contains the header and the edit button*/}
      <Layout style={{ marginTop: 10 }}>
        <LayoutItem>
          <div className="nr1-Box">
            <HeadingText type={HeadingText.TYPE.HEADING_1}>BHN App</HeadingText>
          </div>
        </LayoutItem>
        <LayoutItem type={LayoutItem.TYPE.SPLIT_RIGHT}>
          <div
            style={{ display: "flex", justifyContent: "end", marginRight: 10 }}
          >
            <Button
              onClick={() => {}}
              type={Button.TYPE.NORMAL}
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
            >
              Edit
            </Button>
          </div>
        </LayoutItem>
      </Layout>

      {mountDrawer && (
        <Modal hideDrawer={hideDrawer} onClose={onClose} onHideEnd={onHideEnd}>
          <HeadingText type={HeadingText.TYPE.HEADING_3}>Modal</HeadingText>

          <BlockText
            spacingType={[
              BlockText.SPACING_TYPE.EXTRA_LARGE,
              BlockText.SPACING_TYPE.OMIT,
            ]}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictumst
            quisque sagittis purus sit amet.
          </BlockText>

          <Button onClick={onClose}>Close</Button>
        </Modal>
      )}
    </div>
  );
}

export default AddAppsDrawer;
