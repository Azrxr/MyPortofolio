import React, { useEffect, useState, useCallback, useRef } from "react";

import { supabase } from "../supabase";

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
  const initialItems = 6;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("Pin", { ascending: false })
        .order("created_at", { ascending: false });
      if (projectsData) setProjects(projectsData);

      const { data: certData } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
      if (certData) setCertificates(certData);

      const cached = localStorage.getItem("tech_stack_cache");
      if (cached) setTechStacks(JSON.parse(cached));
      const { data: techData } = await supabase.from("tech_stack").select("title,img");
      if (techData) {
        setTechStacks(techData);
        localStorage.setItem("tech_stack_cache", JSON.stringify(techData));
      }
    } catch (err) {
      console.error(err);
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
                <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5 gap-4">
                  {displayedCertificates.map((certificate, index) => (
                    <div
                      key={certificate.id || index}
                      data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                      data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                    >
                      <Certificate ImgSertif={certificate.Img} />
                    </div>
                  ))}
                </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8 gap-5">
                  {(techStacks.length > 0 ? techStacks : []).map((stack, index) => (
                    <div
                      key={index}
                      data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                      data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                    >
                      <TechStackIcon TechStackIcon={stack.img || stack.icon} Language={stack.title || stack.language} />
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>
          </SwiperSlide>
        </Swiper>
      </Box>
    </div>
  );
}