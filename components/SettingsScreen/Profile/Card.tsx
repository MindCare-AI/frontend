import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="img" />
        <div className="info">
          <span>John Doe</span>
          <p>Web Dev</p>
        </div>
        <a href="#">Button</a>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
   width: 190px;
   height: 254px;
   display: flex;
   flex-direction: column;
   align-items: center;
   background: #f2f2f3;
   border-radius: 12px;
   box-shadow: inset 5px 5px 10px #a9a9aa77,
                inset -5px -5px 10px #ffffff7e;
  }

  .card .img {
   height: 100px;
   margin-top: 1.6em;
   aspect-ratio: 1;
   border-radius: 30%;
   background: #f2f2f3;
   margin-bottom: 0.4em;
   box-shadow: -5px -5px 8px #ffffff7a, 
                5px 5px 8px #a9a9aa7a;
  }

  .card .info {
   text-align: center;
   margin-top: 0.4em;
   background: linear-gradient(120deg, rgba(0,194,255,1) 0%, rgba(0,86,255,1) 100%);
   background-clip: border-box;
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
  }

  .card .info > span {
   font-weight: bold;
   font-size: 1.2em;
  }

  .card a {
   margin-top: 1em;
   color: #fff;
   text-decoration: none;
   background: linear-gradient(90deg, rgba(0,194,255,1) 0%, rgba(0,86,255,1) 100%);
   padding: .5em 2em;
   border-radius: 0.7em;
  }

  .card a:active {
   box-shadow: inset 3px 3px 3px #0056ff,
               inset -3px -3px 3px #00c2ff;
  }`;

export default Card;
