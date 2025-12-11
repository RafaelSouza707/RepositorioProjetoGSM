import { Carousel } from "react-bootstrap";
import "./Carrossel.css";

import img1 from "../Images/img1.jpg";
import img2 from "../Images/img2.jpg";
import img3 from "../Images/img3.png";

const Carrossel = () => {
    return (
        <div className="mb-5">
            <Carousel fade interval={4000} pause="hover" indicators={false}>
                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img1}
                        alt="Superman"
                    />
                    <Carousel.Caption>
                        <h1>Superman</h1>
                        <p>2025 - 2h 9min</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img2}
                        alt="Thunderbolts*"
                    />
                    <Carousel.Caption>
                        <h1>Thunderbolts*</h1>
                        <p>2025 - 2h 7min</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img3}
                        alt="Pecadores"
                    />
                    <Carousel.Caption>
                        <h1>Pecadores</h1>
                        <p>2025 - 2h 17min</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    );
};

export default Carrossel;