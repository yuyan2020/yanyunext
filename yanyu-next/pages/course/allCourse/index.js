import DashboardLayout from "../../../components/layouts/dashboard";
import CourseCard from "../../../components/course/courseCard";

import React, { useState, useEffect } from "react";
import { List, Skeleton, Divider } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { getCourses } from "../../../lib/api/apiService";

function AllCourse() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    setPage(page + 1);

    getCourses({ page: page, limit: 20 })
      .then((res) => {
        const courses = res.data.data.courses;
        setData([...data, ...courses]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <div
      id="scrollableDiv"
      style={{
        height: "100vh",
        overflow: "auto",
        padding: "0 16px",
        width: "100%",
      }}
    >
      {data ? (
        <InfiniteScroll
          dataLength={data.length}
          next={loadMoreData}
          hasMore={true}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          scrollableTarget="scrollableDiv"
        >
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <CourseCard item={item} readMore={true} key={item.id} />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      ) : null}
    </div>
  );
}

AllCourse.Layout = DashboardLayout;

export default AllCourse;
