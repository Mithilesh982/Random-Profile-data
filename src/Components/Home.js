import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "./Styles/Home.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWl0aGlsZXNoMDkiLCJhIjoiY2xzdWs5M2J2MWVmYjJucWt0dW01eGQzcCJ9.xbiqJneEOmrwB3Gllj5-Ew";
// 
// Admin access //////////////////////////////////////
  // userName= Mithilesh
  // password= 1234
////////////////////////////////////////////
function Home() {
  const mapContainer = useRef(null);
  const [globalProfileData, setGlobalProfileData] = useState([]);
  const [filteredProfile, setFilteredProfile] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchProfile, setSearchProfile] = useState("");
  const [adminLogin, setAdminLogin] = useState(false);
  const [adminUserName, setAdminUserName] = useState("");
  const [adminPassWord, setAdminPassword] = useState("");
  const [toModifyData, setToModifyData] = useState([]);
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const mapRef = useRef(null);

  async function fetchRandomUsersFromIndia(numUsers = 20) {
    try {
      const response = await axios.get(
        `https://randomuser.me/api/?nat=IN&results=${numUsers}`
      );
      return response.data.results;
    } catch (error) {
      console.error("Error fetching random users data:", error);
      return null;
    }
  }

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.8567, 18.5204],
      zoom: 9,
    });

    mapRef.current = map;

    map.on("load", async () => {
      try {
        const data = await fetchRandomUsersFromIndia();
        setGlobalProfileData(data);
        setFilteredProfile(data);

        data.forEach((user) => {
          const { latitude, longitude } = user.location.coordinates;
          const popup = new mapboxgl.Popup().setHTML(
            `<h3>${user.name.first} ${user.name.last}</h3><p>${user.location.country}</p>`
          );

          const marker = new mapboxgl.Marker({ color: "#3388ff", scale: 1 })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);

          marker.getElement().addEventListener("click", () => {
            setSelectedUser(user);
            setSelectedMarker(marker);
          });
        });

        map.flyTo({
          center: [
            data[0].location.coordinates.longitude,
            data[0].location.coordinates.latitude,
          ],
          zoom: 4,
        });
      } catch (error) {
        console.log("Error loading profile in map : ", error);
      }
    });

    return () => map.remove();
  }, []);

  const handleSummaryClick = (user) => {
    const { latitude, longitude } = user.location.coordinates;
    const popup = new mapboxgl.Popup().setHTML(
      `<h3>${user.name.first} ${user.name.last}</h3><p>${user.location.country}</p>`
    );

    // Reset appearance of previously selected marker
    if (selectedMarker) {
      selectedMarker.getElement().style.color = "#3388ff";
      selectedMarker.getElement().style.transform = "scale(1)";
    }

    // Add new marker
    const newMarker = new mapboxgl.Marker({ color: "red", scale: 1.5 })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(mapRef.current); // Access map object using ref

    // Open popup by default
    newMarker.getPopup().addTo(mapRef.current);

    setSelectedUser(user);
    setSelectedMarker(newMarker);

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 5,
    });
  };

  const ApplySearch = (search) => {
    let userProfile = globalProfileData.filter((user) => {
      // Assuming user.name is an object with first and last properties
      return (
        user.name.first.toLowerCase().includes(search.toLowerCase()) ||
        user.name.last.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredProfile(userProfile);
  };

  const VerifyAdmin = (username, password) => {
    if (username === "Mithilesh" && password === "1234") {
      alert("Welcome Admin Profile Data is All Your's");
      setAdminLogin(true);
    }
  };

  const UpdateData = (id) => {
    // Reset form fields
    setUserName("");
    setFirstName("");
    setLastName("");
    setAge("");
    setCity("");
    setCountry("");

    // Update the user data in globalProfileData
    const updatedProfileData = globalProfileData.map((user) => {
      if (user.id.value === id) {
        return {
          ...user,
          name: { first: firstName, last: lastName },
          login: { username: userName },
          dob: { age: age },
          location: { city: city, country: country },
        };
      } else {
        return user;
      }
    });

    // Update globalProfileData and filteredProfile simultaneously
    setGlobalProfileData(updatedProfileData);
    setFilteredProfile(updatedProfileData);
  };

  const UserInfo = (id) => {
    alert(id);
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col col-3 sidebar">
            <div className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
                onChange={(e) => {
                  setSearchProfile(e.target.value);
                }}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => ApplySearch(searchProfile)}
              >
                Search
              </button>
            </div>
            <div className="py-3">
              {filteredProfile.length > 0 ? (
                filteredProfile.map((user, index) => (
                  <>
                    <div className="d-flex mx-0 justify-content-evenly align-items-center border border-1 rounded m-2">
                      <div
                        key={index}
                        className="d-flex justify-content-start align-items-center "
                        onClick={() => UserInfo(user.id ? user.id.value : "")}
                      >
                        <div>
                          <img
                            src={user.picture.thumbnail}
                            alt={`${user.name ? user.name.first : ""} ${
                              user.name ? user.name.last : ""
                            }`}
                          />
                        </div>
                        <div>
                          <p>
                            {`${user.name ? user.name.first : ""} ${
                              user.name ? user.name.last : ""
                            }`}{" "}
                            <br /> {user.location.country}{" "}
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleSummaryClick(user)}
                        >
                          Summary
                        </button>
                        {adminLogin ? (
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            data-bs-toggle="modal"
                            data-bs-target="#modifyModal"
                            onClick={() => setToModifyData(user)}
                          >
                            Modify
                          </button>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </>
                ))
              ) : (
                <>
                  <div className="d-flex align-items-center">
                    <strong role="status">
                      Fetching User Data Takes Time ...
                    </strong>
                    <div
                      className="spinner-border ms-auto"
                      aria-hidden="true"
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col col-9 map-col">
            <div ref={mapContainer} style={{ width: "100%", height: "90vh" }} />
          </div>
        </div>
      </div>

      {adminLogin ? (
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Admin
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">EDIT DELETE ADD</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Verify Admin
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder="Mithilesh"
                    onChange={(e) => {
                      setAdminUserName(e.target.value);
                    }}
                  />
                  <label for="floatingInput">UserName</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Password"
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                    }}
                  />
                  <label for="floatingPassword">Password</label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={() => VerifyAdmin(adminUserName, adminPassWord)}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="modal fade"
        id="modifyModal"
        tabIndex="-1"
        aria-labelledby="modifyModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Modify{" "}
                {toModifyData
                  ? `
                  ${toModifyData.name ? toModifyData.name.first : ""} 
                  ${toModifyData.name ? toModifyData.name.last : ""}
                  `
                  : ""}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setToModifyData([])}
              ></button>
            </div>
            <div className="modal-body">
              <h5 className="">Old Info</h5>
              <p>
                {toModifyData ? (
                  <div className="">
                    <h6 className="">
                      {" "}
                      UserName :
                      <span className="fs-5 mx-2">
                        {" "}
                        {toModifyData.login ? toModifyData.login.username : ""}
                      </span>{" "}
                    </h6>
                    <h6>
                      Name :
                      <span className="fs-5 mx-2">
                        {toModifyData.name
                          ? `${toModifyData.name.first} ${toModifyData.name.last}`
                          : ""}
                      </span>
                    </h6>
                    <h6>
                      AGE :{" "}
                      <span className="fs-5 mx-2">
                        {" "}
                        {toModifyData.dob ? toModifyData.dob.age : ""}
                      </span>
                    </h6>
                    <h6>
                      City :
                      <span className="fs-5 mx-2">
                        {toModifyData.location
                          ? toModifyData.location.city
                          : ""}
                      </span>
                    </h6>
                    <h6>
                      Country :
                      <span className="fs-5">
                        {toModifyData.location
                          ? toModifyData.location.country
                          : ""}
                      </span>
                    </h6>
                  </div>
                ) : (
                  ""
                )}
              </p>
              <div className="">
                <h4 className="">New Data</h4>
                <form className="">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="UserNameUpdate"
                      placeholder="Usernmame"
                      
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setUserName(e.target.value)
                          : setUserName(toModifyData.login.username);
                      }}
                    />
                    <label for="UserNameUpdate">UserName</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="FirstNameUpdate"
                      placeholder="First Name"
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setFirstName(e.target.value)
                          : setFirstName(toModifyData.login.username);
                      }}
                    />
                    <label for="FirstNameUpdate">First Name</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="LastNameUpdate"
                      placeholder="Last Name"
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setLastName(e.target.value)
                          : setLastName(toModifyData.login.username);
                      }}
                    />
                    <label for="LastNameUpdate">Last Name</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="ageUpdate"
                      placeholder="Age"
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setAge(e.target.value)
                          : setAge(toModifyData.login.username);
                      }}
                    />
                    <label for="ageUpdate">Age</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="cityUpdate"
                      placeholder="City"
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setCity(e.target.value)
                          : setCity(toModifyData.login.username);
                      }}
                    />
                    <label for="cityUpdate">City</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="countryUpdate"
                      placeholder="Country"
                      
                      onChange={(e) => {
                        e.target.value.length > 0
                          ? setCountry(e.target.value)
                          : setCountry(toModifyData.login.username);
                      }}
                    />
                    <label for="countryUpdate">Country</label>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={() => UpdateData(toModifyData.id.value)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
