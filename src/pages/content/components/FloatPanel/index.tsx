import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { Card, FloatButton, Popover, Tree } from "antd";
import { getRecentlyAppId, getSessionId } from "../../utils";
import { getPublishedFileDetails, getUserCollections } from "../../serives";
import { useCollectionParse } from "./hook";
const Compilations: FC<{ data: any[] }> = ({ data = [] }) => {
  const tranformData = useMemo(() => {
    return data;
  }, [data]);
  console.log(tranformData);

  return (
    <Card>
      <div
        style={{
          minHeight: 400,
          width: 300,
          maxHeight: 800,
          overflow: "scroll",
        }}
      >
        <Tree treeData={tranformData} />
      </div>
    </Card>
  );
};
function FloatPanel() {
  const [openPopover, setOpenPopover] = useState(false);
  const appId = getRecentlyAppId();
  const sessionId = getSessionId();
  const [collections, setCollections] = useState([]);
  useEffect(() => {
    getUserCollections({ appid: appId, sessionid: sessionId }).then((res) => {
      console.log(res);

      if (res.success === 1) {
        const cl = useCollectionParse(res);
        cl.map(async (item) => {
          const publishedfileids = item.children.map(
            (chil) => chil.publishedfileid
          );
          const publishedfileDetails = await getPublishedFileDetails({
            itemcount: publishedfileids.length,
            publishedfileids: publishedfileids,
          });
          item.children = publishedfileDetails.response.publishedfiledetails;
          return item;
        });
        setCollections(cl);
      }
    });
  }, []);
  return (
    <div>
      <Popover content={<Compilations data={collections} />} open={openPopover}>
        <FloatButton onClick={() => setOpenPopover((value) => !value)} />
      </Popover>
    </div>
  );
}
export default FloatPanel;
