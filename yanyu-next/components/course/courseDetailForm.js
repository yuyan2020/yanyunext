import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Upload,
  Spin,
} from "antd";
import debounce from "lodash/debounce";
import { InboxOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Dragger } = Upload;
import { useState, useEffect, useRef, useMemo } from "react";
import {
  getCourseCode,
  getCourseType,
  getTeacherById,
  getTeachers,
} from "../../lib/api/apiService";
const durationUnit = (
  <Select defaultValue="month" className="select-after">
    <Option value="year">year</Option>
    <Option value="month">month</Option>
    <Option value="day">day</Option>
    <Option value="week">week</Option>
    <Option value="hour">hour</Option>
  </Select>
);

// const draggerProps = {
//   name: "file",
//   multiple: true,
//   action: "http://localhost:3000/",
//   height: "300px",

//   onChange(info) {
//     const { status } = info.file;

//     if (status !== "uploading") {
//       console.log(info.file, info.fileList);
//     }

//     if (status === "done") {
//       message.success(`${info.file.name} file uploaded successfully.`);
//     } else if (status === "error") {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },

//   onDrop(e) {
//     console.log("Dropped files", e.dataTransfer.files);
//   },
// };

const DebounceSelect = ({ fetchOptions, debounceTimeout = 800, ...props }) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      // fetchRef.current += 1;
      // const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      value &&
        fetchOptions(value).then((newOptions) => {
          // if (fetchId !== fetchRef.current) {
          //   // for fetch callback order
          //   return;
          // }

          console.log(newOptions);
          setOptions(newOptions);
          setFetching(false);
        });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
};

async function fetchTeacherList(username) {
  // console.log("fetching user", username);
  return getTeachers({ query: username }).then((res) =>
    res.data.data.teachers.map((user) => ({
      label: user.name,
      value: user.id,
    }))
  );
}

const courseDetailForm = (props) => {
  const [form] = Form.useForm();
  const [cType, setCType] = useState([]);

  const [teacher, setTeacher] = useState([]);

  const normFile = (e) => {
    console.log("Upload event:", e);

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const onChange = (values) => {
    console.log(values.target.value);
  };

  const getTeacherName = async (id) => {
    const name = getTeacherById(id).then((res) => res.data.data.name);
    return name;
  };

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    let selectType;
    if (props.t) {
      console.log(props.t);
      console.log(cType);
      selectType = props.t.map((k) => ({
        id: k,
        name: cType[parseInt(k)].name,
      }));
    }
    props.setData({
      name: values.courseName,
      uid: values.courseCode,
      detail: values.description,
      startTime: values.startDate,
      price: values.price,
      maxStudents: values.studentLimit,
      duration: values.duration,
      durationUnit: 1,
      cover: "string",
      teacherId: values.teacher,
      type: selectType,
    });

    console.log("zheli");
    console.log(props.data);
    props.nextStep();
  };

  const onBlur = () => {
    console.log("blur");
  };

  const onFocus = () => {
    console.log("focus");
  };
  const onSearch = (val) => {
    console.log("search:", val);
  };

  useEffect(() => {
    if (!props.uid) {
      getCourseCode().then((res) => {
        props.setUid(res.data.data);
        form.setFieldsValue({ courseCode: res.data.data });
      });
    }
  }, []);

  useEffect(() => {
    if (props.data.name) {
      console.log(props.data);
      (async function () {
        let name = await getTeacherName(props.data.teacherId);
        form.setFieldsValue({
          courseCode: props.uid ? props.uid : null,
          courseName: props.data.name,
          teacher: name,
          type: props.data.type.map((t) => t.name),
          price: props.data.price,
          studentLimit: props.data.maxStudents,
          duration: props.data.duration,
        });
      })();
    }
  }, [props.current]);

  useEffect(() => {
    getCourseType().then((res) => setCType(res.data.data));
  }, []);

  return (
    <>
      <Form
        // {...formItemLayout}
        form={form}
        name="courseDetail"
        onFinish={onFinish}
        // initialValues={{
        //   residence: ["zhejiang", "hangzhou", "xihu"],
        //   prefix: "86",
        // }}
        scrollToFirstError
        layout="vertical"
        // initialValues={{ courseCode: code ? code : null }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Course Name"
              name="courseName"
              rules={[
                { required: true, message: "Please input your course name!" },
              ]}
            >
              <Input placeholder="course name" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Teacher"
              name="teacher"
              rules={[
                { required: true, message: "Please select your teacher!" },
              ]}
            >
              <DebounceSelect
                // mode="multiple"
                // value={teacher}
                placeholder="Select Teacher"
                fetchOptions={fetchTeacherList}
                // onChange={(newValue) => {
                //   setTeacher(newValue);
                // }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Type"
              name="type"
              rules={[
                { required: true, message: "Please input your course type!" },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{
                  width: "100%",
                }}
                placeholder="Please select type"
                defaultValue={[]}
                onChange={(e) => props.st(e)}
              >
                {cType
                  ? cType.map((t) => <Option key={t.id}>{t.name}</Option>)
                  : null}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Course Code"
              name="courseCode"
              rules={[{ required: true }]}
            >
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Start Date" name="startDate">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Price"
              name="price"
              rules={[
                {
                  required: true,
                  message: "Please input your course price!",
                },
              ]}
            >
              <Input prefix="$" placeholder="Course price" />
            </Form.Item>
            <Form.Item
              label="Student Limit"
              name="studentLimit"
              rules={[
                {
                  required: true,
                  message: "Please input your course student limit!",
                },
              ]}
            >
              <Input placeholder="Student Limit" />
            </Form.Item>
            <Form.Item
              label="Duration"
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Please input your course duration!",
                },
              ]}
            >
              <Input placeholder="course duration" addonAfter={durationUnit} />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={13} />
            </Form.Item>
          </Col>
          <Col span={9}>
            {/* <Form.Item label="Cover" name="cover" rules={[{}]}>
              <Dragger {...draggerProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from
                  uploading company data or other band files
                </p>
              </Dragger>
            </Form.Item> */}
            <Form.Item label="Dragger">
              <Form.Item
                name="dragger"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
              >
                <Dragger name="files" action="/upload.do" height="300px">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload.
                  </p>
                </Dragger>
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Course
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </>
  );
};

export default courseDetailForm;
