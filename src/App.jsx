import Axios from "axios";
import { loadModules } from "esri-loader";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

function App(props) {
  const mapRef = useRef();
  const [property, setProperty] = useState("confirmed");

  const [location, setLocation] = useState("polygon");

  const locationOptions = [
    { label: "Quận", value: "polygon" },
    { label: "Bang", value: "region" },
  ];

  const [dates, setDates] = useState([]);
  const [date, setDate] = useState("");
  useEffect(() => {
    Axios.get("https://apigis.azurewebsites.net/api/epidemic/date.php").then((res) => {
      setDates(res.data.data);
      setDate(res.data.data[0]);
    });
  }, []);


  const datesOption = dates.map((date) => ({
    value: date,
    label: date,
  }));

  useEffect(() => {
    if (date) {
      loadModules(
        [
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GeoJSONLayer",
          "esri/widgets/Legend",
        ],
        { css: true }
      ).then(([ArcGISMap, MapView, GeoJSONLayer, Legend]) => {
        const less100 = {
          type: "simple-fill",
          color:
            property === "recovered" ? [3, 169, 252, 0.2] : [255, 229, 217],
          style: "solid",
          outline: {
            width: 0.2,
            color: [255, 255, 255],
          },
        };

        const less200 = {
          type: "simple-fill",
          color:
            property === "recovered" ? [3, 169, 252, 0.3] : [252, 167, 181],
          style: "solid",
          outline: {
            width: 0.2,
            color: [255, 255, 255],
          },
        };

        const less500 = {
          type: "simple-fill",
          color:
            property === "recovered" ? [3, 169, 252, 0.5] : [252, 146, 114],
          style: "solid",
          outline: {
            width: 0.2,
            color: [255, 255, 255],
          },
        };
        const less1000 = {
          type: "simple-fill",
          color: property === "recovered" ? [3, 169, 252, 0.8] : [251, 106, 74],
          style: "solid",
          outline: {
            width: 0.2,
            color: [255, 255, 255],
          },
        };
        const less10000 = {
          type: "simple-fill",
          color: property === "recovered" ? [3, 169, 252, 1] : [203, 24, 29],
          style: "solid",
          outline: {
            width: 0.2,
            color: [255, 255, 255],
          },
        };
        const more10000 = {
          type: "simple-fill",
          color: property === "recovered" ? [3, 169, 253] : [153, 0, 13],
          style: "solid",
          outline: {
            width: 0.2,
            color:
              property === "recovered" ? [3, 169, 252, 1] : [255, 255, 255],
          },
        };
        const renderer = {
          type: "class-breaks",
          field: property,
          defaultSymbol: {
            type: "simple-fill",
            color: "white",
            style: "solid",
            outline: {
              width: 0.5,
              color: [50, 50, 50, 0.6],
            },
          },
          defaultLabel: "no data",
          classBreakInfos: [
            {
              minValue: 0,
              maxValue: 99,
              symbol: less100,
              label: "<100",
            },
            {
              minValue: 100,
              maxValue: 199,
              symbol: less200,
              label: "< 200",
            },
            {
              minValue: 200,
              maxValue: 499,
              symbol: less500,
              label: "< 500",
            },
            {
              minValue: 500,
              maxValue: 999,
              symbol: less1000,
              label: "< 1000",
            },
            {
              minValue: 1000,
              maxValue: 10000,
              symbol: less10000,
              label: "< 10000",
            },
            {
              minValue: 10000,
              maxValue: 1000000000,
              symbol: more10000,
              label: "> 10000",
            },
          ],
        };

        const geojsonLayer = new GeoJSONLayer({
          // url: `https://apigis.azurewebsites.net/api/${location}/data.php?date=${date}`,
          url: `http://localhost:81/gis/api/${location}/data.php?date=${date}`,
          renderer: renderer,
          popupTemplate: {
            title: "Thông tin dịch bệnh",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "date",
                    label: "Ngày",
                  },
                  {
                    fieldName: "name",
                    label: "Tên:",
                  },

                  {
                    fieldName: "confirmed",
                    label: "Số Ca Đã Xác Nhận",
                  },
                  {
                    fieldName: "recovered",
                    label: "Số Ca Đã Hồi Phục",
                  },
                  {
                    fieldName: "deaths",
                    label: "Số Ca Đã Chết",
                  },
                ],
              },
              {
                type: "media", // MediaContentElement
                mediaInfos: [
                  {
                    title: "<b>Tỷ lệ</b>",
                    type: "pie-chart",
                    caption: "",
                    value: {
                      fields: ["deaths", "recovered", "active"],
                      normalizeField: null,
                    },
                  },
                ],
              },
            ],
          },
        });
        const map = new ArcGISMap({
          basemap: {
            portalItem: {
              id: "3582b744bba84668b52a16b0b6942544",
            },
          },
          layers: [geojsonLayer],
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-113.7227724, 36.2462876],
          zoom: 4,
        });

        map.on("load", function () {
          map.graphics.enableMouseEvents();
        });

        view.ui.add(
          new Legend({
            view: view,

            layerInfos: [
              {
                layer: geojsonLayer,
                title: "Thông Tin Dịch Bệnh",
              },
            ],
          }),
          "top-right"
        );

      
        return () => {
          if (view) {
            view.destroy();
          }
        };
      });
    }
  });
  return date ? (
    <div className="d-flex justify-content-between">
      <div className="card" style={{ width: "20%" }}>
        <div className="card-header">
          <h6 className="card-title">Lựa chọn thuộc tính xem</h6>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="">Chọn kiểu khu vực</label>
            <Select
              placeholder="Chọn kiểu khu vực"
              options={locationOptions}
              defaultValue={{
                label: locationOptions[0].label,
                value: locationOptions[0].label,
              }}
              onChange={(value) => {
                setLocation(value.value);
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Chọn ngày</label>
            <Select
              placeholder="Chọn ngày"
              defaultValue={{
                value: datesOption[0].value,
                label: datesOption[0].label,
              }}
              options={datesOption}
              onChange={(value) => {
                setDate(value.value);
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Chọn thuộc tính xem</label>
            <Select
              placeholder="Chọn Thuộc Tính"
              defaultValue={{
                value: "confirmed",
                label: "Số ca đã xác nhận",
              }}
              options={[
                { value: "confirmed", label: "Số ca đã xác nhận" },
                { value: "recovered", label: "Số ca phục hồi" },
                { value: "deaths", label: "Số ca tử vong" },
              ]}
              onChange={(value) => {
                setProperty(value.value);
              }}
            ></Select>
          </div>
        </div>
      </div>
      <div
        style={{ height: "100vh", width: "80%" }}
        ref={mapRef}
        className="w-80"
      />
    </div>
  ) : null;
}

App.propTypes = {};

export default App;
