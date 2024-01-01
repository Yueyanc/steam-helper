import { useState, useContext } from "react";
import { FloatButton, Drawer } from "antd";
import TreeModel from "tree-model";
import { GlobalContext } from "../../context";
import _ from "lodash";
import ModsTable from "./ModsTable";
const tree = new TreeModel();

const SideDrawer: React.FC<any> = () => {
  const [open, setOpen] = useState(false);
  const { root: rootDom } = useContext(GlobalContext);
  const drawerClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Drawer
        forceRender
        width={"auto"}
        rootClassName="fixed"
        className="max-h-screen backdrop-blur-3xl !bg-transparent"
        placement="right"
        open={open}
        closable={false}
        onClose={drawerClose}
        maskClosable
        getContainer={() => rootDom}
      >
        <ModsTable />
      </Drawer>
      <FloatButton
        className="bg-gradient-to-r from-purple-500 to-pink-500 "
        onClick={() => {
          setOpen(true);
        }}
      />
    </div>
  );
};
export default SideDrawer;
