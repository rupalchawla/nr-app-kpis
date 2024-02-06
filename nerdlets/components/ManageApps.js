import { useEffect, useRef, useState } from "react";
import {
  Layout,
  LayoutItem,
  Button,
  HeadingText,
  Modal,
  BlockText,
  AccountPicker,
  Stack,
  StackItem,
  EntitiesByNameQuery,
  EntitiesByDomainTypeQuery,
  TextField,
  List,
  ListItem,
  AccountStorageMutation,
  AccountStorageQuery,
  Toast,
} from "nr1";

import _ from "lodash";

// Timeout function's id to look for keypress
// in the search app field
let timeoutId;
const storageConfig = {
  accountId: 2119955,
  collection: "bhn-apps",
  documentId: "nr-app-storage",
};

function ManageApps({ callback }) {
  // Hide and show the drawer
  const [hideAddAppDrawer, setHideAddAppDrawer] = useState(true);
  const [hideEditAppDrawer, setHideEditAppDrawer] = useState(true);
  // Check if the drawer is mountAddAppDrawer
  const [mountAddAppDrawer, setMountAddAppDrawer] = useState(false);
  const [mountEditAppDrawer, setMountEditAppDrawer] = useState(false);

  // Function to open the drawer
  function openAddAppDrawer() {
    setHideAddAppDrawer(false);
    setMountAddAppDrawer(true);
  }

  // Function to close the drawer
  const closeAddAppDrawer = () => {
    setHideAddAppDrawer(true);
    callback();
  };

  // Function to open the drawer
  function openEditAppDrawer() {
    setHideEditAppDrawer(false);
    setMountEditAppDrawer(true);
  }

  // Function to close the drawer
  const closeEditAppDrawer = () => {
    setHideEditAppDrawer(true);
    callback();
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
            {/* Edit button */}
            <Button
              onClick={openEditAppDrawer}
              type={Button.TYPE.NORMAL}
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
            >
              Edit
            </Button>
            {/* Add button */}
            <Button
              onClick={openAddAppDrawer}
              type={Button.TYPE.NORMAL}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
              style={{ marginLeft: 10 }}
            >
              Add
            </Button>
          </div>
        </LayoutItem>
      </Layout>
      {/* Drawer */}
      {mountAddAppDrawer && (
        <AddAppDrawer
          hidden={hideAddAppDrawer}
          onClose={closeAddAppDrawer}
          onHideEnd={() => setMountAddAppDrawer(false)}
        />
      )}
    </div>
  );
}

function AddAppDrawer({ hidden, onClose, onHideEnd }) {
  //Loading, the values are "true", "false", "error
  const [loading, setLoading] = useState("false");
  const [entities, setEntities] = useState();
  //This variable will hold stored data from the account storage
  const [storedEntities, setStoredEntities] = useState();
  //Make sure we call API only one time
  let callAPI = useRef(true);

  /**======================
   *?   useEffect
   * When component loads,
   * get data from account storage
   *========================**/
  useEffect(() => {
    //Prevent redundant api calls with ref
    if (!callAPI.current) {
      return;
    }
    callAPI.current = false;

    getDataFromAccountStorage();
  }, []);

  /**======================
   * getDataFromAccountStorage
   * Get stored data from the account storage
   *========================**/
  const getDataFromAccountStorage = async () => {
    try {
      const storedData = await AccountStorageQuery.query({
        accountId: storageConfig.accountId,
        collection: storageConfig.collection,
        documentId: storageConfig.documentId,
      });

      console.log("Stored data = ", storedData);
      if (storedData && storedData.data && storedData.data.entities) {
        setStoredEntities(storedData.data.entities);
      }
    } catch (error) {
      console.error("Error fetching data from account storage", error);
    }
  };

  // Make API call to fetch the entities
  const getEntitiesFromNewRelic = async (queryValue) => {
    console.log("Going to search for ", queryValue);

    try {
      setLoading("true");
      const data = await EntitiesByNameQuery.query({
        entityDomain: "APM",
        entityType: "APPLICATION",
        name: queryValue,
      });

      console.log("Entities returned = ", data, data.data, data.data.entities);

      if (
        data &&
        data.data &&
        data.data.entities &&
        data.data.entities.length > 0
      ) {
        //Loop through each entity and set selected to false
        data.data.entities.forEach((e) => {
          if (storedEntities) {
            const _stored = storedEntities.find((se) => se.guid === e.guid);
            if (_stored) {
              e.selected = true;
            } else {
              e.selected = false;
            }
          } else {
            e.selected = false;
          }
        });

        setEntities(data.data.entities);
      }

      setLoading("false");
    } catch (error) {
      console.error("Error fetching entities", error);
      setLoading("error");
    }
  };

  // Function to handle the search app field
  const onSearchApp = (e) => {
    console.log(e.target.value);
    const value = e.target.value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      getEntitiesFromNewRelic(value);
    }, 500);
  };

  /**======================
   **   onSelectApp
   * When an app is selected,
   * loop through the list of entities
   * and set the selected to true
   * @param entity
   *========================**/
  const onSelectApp = (entity) => {
    //Find entity in the list and set
    // selected to true
    let _entities = _.cloneDeep(entities);
    _entities.forEach((e) => {
      if (e.guid === entity.guid) {
        e.selected = !e.selected;
      }
    });

    setEntities(_entities);
  };

  /**======================
   * saveSelectedApps
   * Save the selected apps to the database
   *
   *========================**/
  const saveSelectedApps = async () => {
    // Save the selected apps to the database
    console.log("Save the selected apps to the database");

    //No need to save if there are no entities
    if (!entities) {
      return;
    }

    let storeEntities = [];
    entities.forEach((e) => {
      if (e.selected) {
        storeEntities.push(e);
      }
    });

    console.log("Entities to store = ", storeEntities);

    if (storeEntities.length === 0) {
      Toast.showToast({
        title: "Error",
        description: "Please select at least one application.",
        type: Toast.TYPE.CRITICAL,
      });

      return;
    }

    try {
      setLoading("saving");
      await AccountStorageMutation.mutate({
        accountId: storageConfig.accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: storageConfig.collection,
        documentId: storageConfig.documentId,
        document: {
          entities: storeEntities,
        },
      });

      Toast.showToast({
        title: "Saved",
        description: "The selected applications have been saved.",
        type: Toast.TYPE.NORMAL,
      });
    } catch (error) {
      console.error("Error saving data to account storage", error);

      Toast.showToast({
        title: "Error",
        description: "Error saving data to account storage. Please try again.",
        type: Toast.TYPE.CRITICAL,
      });
    } finally {
      setLoading("false");
    }
  };

  return (
    <Modal hidden={hidden} onClose={onClose} onHideEnd={onHideEnd}>
      <HeadingText type={HeadingText.TYPE.HEADING_3}>
        Update App List
      </HeadingText>

      <BlockText
        spacingType={[
          BlockText.SPACING_TYPE.EXTRA_LARGE,
          BlockText.SPACING_TYPE.OMIT,
        ]}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Dictumst quisque
        sagittis purus sit amet.
      </BlockText>

      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        verticalType={Stack.VERTICAL_TYPE.TOP}
        gapType={Stack.GAP_TYPE.MEDIUM}
      >
        {/* Search app field */}
        <StackItem>
          <TextField
            type={TextField.TYPE.SEARCH}
            placeholder="Application name"
            onChange={onSearchApp}
            loading={loading === "true"}
          />
        </StackItem>
        <StackItem>
          {/* List of apps */}
          {entities && entities.length > 0 && (
            <div>
              <HeadingText type={HeadingText.TYPE.HEADING_4}>
                {entities.length} Applications Found
              </HeadingText>
              <BlockText spacingType={[BlockText.SPACING_TYPE.OMIT]}>
                Select the applications below to add a chart for them in the
                dashboard.
              </BlockText>
              <br />
              <List
                items={entities}
                rowCount={entities.length}
                rowHeight={30}
                onLoadMore={() => {}} // Not implemented
                style={{ height: "400px", overflow: "auto" }}
              >
                {({ item }) => (
                  <ListItem
                    key={item.guid}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <div>{item.name}</div>
                    <div>
                      <Button
                        onClick={() => onSelectApp(item)}
                        type={
                          item.selected
                            ? Button.TYPE.PRIMARY
                            : Button.TYPE.NORMAL
                        }
                        iconType={Button.ICON_TYPE.INTERFACE__SIGN__CHECKMARK}
                        sizeType={Button.SIZE_TYPE.SMALL}
                      />
                    </div>
                  </ListItem>
                )}
              </List>
            </div>
          )}
        </StackItem>
        {/* Close button */}
        <StackItem>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>Close</Button>

            <Button
              iconType={
                Button.ICON_TYPE.INTERFACE__SIGN__CHECKMARK__V_ALTERNATE
              }
              loading={loading === "saving"}
              type={Button.TYPE.PRIMARY}
              onClick={saveSelectedApps}
              style={{ marginLeft: 10 }}
            >
              Save
            </Button>
          </div>
        </StackItem>
      </Stack>
    </Modal>
  );
}

export default ManageApps;
