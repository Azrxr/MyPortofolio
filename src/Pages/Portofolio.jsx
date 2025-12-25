import React, { useEffect, useState, useCallback, useRef } from "react";

import { getProjects, getCertificates, getTechStacks } from "../services/projectService";

import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import AOS from "aos";
import "aos/dist/aos.css";
import Certificate from "../components/Certificate";
import { Code, Award, Boxes } from "lucide-react";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, md: 2 } }}>{children}</Box>}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

const ToggleButton = ({ onClick, isShowingMore }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
  >
    {isShowingMore ? "Show less" : "Show more"}
  </button>
);

export default function Portofolio() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const swiperRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [techStacks, setTechStacks] = useState([]);

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialItems = 6;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsData = await getProjects();
      if (projectsData) {
        setProjects(projectsData);
        // Save to localStorage for About page stats
        localStorage.setItem("projects", JSON.stringify(projectsData));
      }

      const certData = await getCertificates();
      if (certData) {
        setCertificates(certData);
        // Save to localStorage for About page stats
        localStorage.setItem("certificates", JSON.stringify(certData));
      }

      const cached = localStorage.getItem("tech_stack_cache");
      if (cached) setTechStacks(JSON.parse(cached));
      const techData = await getTechStacks();
      if (techData) {
        setTechStacks(techData);
        localStorage.setItem("tech_stack_cache", JSON.stringify(techData));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data. Silakan periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (swiperRef.current && swiperRef.current.slideTo) {
      try {
        swiperRef.current.slideTo(newValue);
      } catch (e) {}
    }
  };

  const toggleShowMore = (type) => {
    if (type === "projects") setShowAllProjects((s) => !s);
    if (type === "certificates") setShowAllCertificates((s) => !s);
  };

  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems);
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  return (
    <div className="md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[#030014] overflow-hidden" id="Portofolio">
      <div className="text-center pb-10" data-aos="fade-up" data-aos-duration="1000">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-center mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
          <span
            style={{
              color: "#6366f1",
              backgroundImage: "linear-gradient(45deg, #6366f1 10%, #a855f7 93%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Portfolio Showcase
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
          Explore my journey through projects, certifications, and technical expertise. Each section
          represents a milestone in my continuous learning path.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center" data-aos="fade-in">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center" data-aos="fade-in">
          <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Memuat Data</span>
          </div>
          <p className="text-blue-300 text-sm">Sedang mengambil data portfolio...</p>
        </div>
      )}

      <Box sx={{ width: "100%" }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
              backdropFilter: "blur(10px)",
              zIndex: 0,
            },
          }}
          className="md:px-4"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
            sx={{
              minHeight: "70px",
              "& .MuiTab-root": {
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: "600",
                color: "#94a3b8",
                textTransform: "none",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "20px 0",
                zIndex: 1,
                margin: "8px",
                borderRadius: "12px",
                "&:hover": {
                  color: "#ffffff",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-selected": {
                  color: "#fff",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
                  boxShadow: "0 4px 15px -3px rgba(139, 92, 246, 0.2)",
                },
              },
              "& .MuiTabs-indicator": {
                height: 0,
              },
              "& .MuiTabs-flexContainer": {
                gap: "8px",
              },
            }}
          >
            <Tab icon={<Code className="mb-2 w-5 h-5 transition-all duration-300" />} label="Projects" {...a11yProps(0)} />
            <Tab icon={<Award className="mb-2 w-5 h-5 transition-all duration-300" />} label="Certificates" {...a11yProps(1)} />
            <Tab icon={<Boxes className="mb-2 w-5 h-5 transition-all duration-300" />} label="Tech Stack" {...a11yProps(2)} />
          </Tabs>
        </AppBar>

        <Swiper
          onSlideChange={(swiper) => setValue(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          initialSlide={value}
          slidesPerView={1}
          spaceBetween={0}
        >
          <SwiperSlide>
            <TabPanel value={value} index={0} dir={theme.direction}>
              <div className="container mx-auto flex justify-center items-center overflow-hidden">
                {projects.length === 0 && !loading ? (
                  <div className="text-center py-12" data-aos="fade-in">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Tidak Ada Proyek</h3>
                    <p className="text-gray-500">Data proyek belum tersedia atau gagal dimuat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {displayedProjects.map((project, index) => (
                      <div
                        key={project.id || index}
                        data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                        data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                      >
                        <CardProject Img={project.Img} Title={project.Title} Description={project.Description} Link={project.Link} id={project.id} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {projects.length > initialItems && (
                <div className="mt-6 w-full flex justify-start">
                  <ToggleButton onClick={() => toggleShowMore("projects")} isShowingMore={showAllProjects} />
                </div>
              )}
            </TabPanel>
          </SwiperSlide>

          <SwiperSlide>
            <TabPanel value={value} index={1} dir={theme.direction}>
              <div className="container mx-auto flex justify-center items-center overflow-hidden">
                {certificates.length === 0 && !loading ? (
                  <div className="text-center py-12" data-aos="fade-in">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Tidak Ada Sertifikat</h3>
                    <p className="text-gray-500">Data sertifikat belum tersedia atau gagal dimuat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5 gap-4">
                    {displayedCertificates.map((certificate, index) => (
                      <div
                        key={certificate.id || index}
                        data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                        data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                      >
                        <Certificate ImgSertif={certificate.img} title={certificate.title} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {certificates.length > initialItems && (
                <div className="mt-6 w-full flex justify-start">
                  <ToggleButton onClick={() => toggleShowMore("certificates")} isShowingMore={showAllCertificates} />
                </div>
              )}
            </TabPanel>
          </SwiperSlide>

          <SwiperSlide>
            <TabPanel value={value} index={2} dir={theme.direction}>
              <div className="container mx-auto flex justify-center items-center overflow-hidden pb-[5%]">
                {techStacks.length === 0 && !loading ? (
                  <div className="text-center py-12" data-aos="fade-in">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Tidak Ada Tech Stack</h3>
                    <p className="text-gray-500">Data tech stack belum tersedia atau gagal dimuat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8 gap-5">
                    {(techStacks.length > 0 ? techStacks : []).map((stack, index) => (
                      <div
                        key={index}
                        data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                        data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                      >
                        <TechStackIcon TechStackIcon={stack.icon} Language={stack.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>
          </SwiperSlide>
        </Swiper>
      </Box>
    </div>
  );
}