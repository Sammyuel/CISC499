/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo, useState } from 'react';
import {
  Sigma,
  RandomizeNodePositions,
  RelativeSize,
  ForceAtlas2,
} from 'react-sigma';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import H2 from 'components/H2';
import ListItem from 'components/ListItem';
import List from 'components/List';
import Header from 'components/Header';
import ReposList from 'components/ReposList';
import { Graph, Link } from 'react-d3-graph';
import AtPrefix from './AtPrefix';
import CenteredSection from './CenteredSection';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';
import { loadRepos } from '../App/actions';
import { changeUsername, changeData } from './actions';
import {
  makeSelectUsername,
  makeSelectData,
  makeSelectAnswer,
  makeSelectAnswerShown,
  makeSelectTableT,
  makeSelectTableU,
  makeSelectTableC
} from './selectors';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Dropdown from 'react-bootstrap/Dropdown';
import Accordion from 'react-bootstrap/Accordion';
import reducer from './reducer';
import saga from './saga';
import Banner from './Header.png';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
const uuid = require('uuid/v4');

const key = 'home';

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

export function HomePage({
  username,
  loading,
  error,
  repos,
  onSubmitForm,
  onChangeUsername,
  onChangeData,
  graphData,
  tableTForOneTriple,
  tableUForOneTriple,
  tableCForOneTriple,
  tableTForThreeTriple,
  tableUForThreeTriple,
  tableCForThreeTriple

}) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  useEffect(() => {
    // When initial state username is not null, submit the form to load repos
    if (username && username.trim().length > 0) onSubmitForm();
  }, []);

  const forceUpdate = useForceUpdate();

  const createPoints = function(){
    let xPoints = randomizePoints(graphData.data.numberOfPoints)
    let yPoints = randomizePoints(graphData.data.numberOfPoints)
    let points = []

    for(let i=0; i<xPoints.length; i+=1){
      points.push({x:xPoints[i], y:yPoints[i]})
    }
    let newNodes = [];

    for (const node of points) {
      const setUUID = uuid();
      const tempNode = {
        id: setUUID,
        fx: parseInt(node.x),
        fy: parseInt(node.y),
        fontColor: 'transparent',
        fontSize: 0,
        size: 50,
      };

      newNodes.push(tempNode);
    }

    let selfLinks = []

    for (const node of newNodes) {
      const link = {
        source: node.id,
        target: node.id
      };

      selfLinks.push(link);
    }


    newNodes = transformCoords(newNodes);
    graphData.data.links = selfLinks;
    graphData.data.nodes = newNodes;
    graphData.data.points = points;
    graphData.data.text = "Run Algorithm"
    graphData.data.count = 0 ;
    forceUpdate();
  }


  const randomizePoints = function(number){
    var arr = [];
    let distanceScaleFactor = number > 20 ? number * 1.5 : 0
    let max = number > 10 ? 60 + distanceScaleFactor : 20;
    let min = number < 10 ? 10 : 0;
    
    while(arr.length < number){
        var r = Math.floor(Math.random() * (max - min + 1) + min);
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    return arr.filter(function (value) {
      return !Number.isNaN(value);});
  }


  const runAndDraw = function() {

    const test = graphAlgorthmRunner(graphData.data.points);
    graphData.answer = test;
    graphData.answerShown = test.length - 1


    drawGraph(graphData.data.points, graphData.answer[graphData.answerShown].links, 
      graphData.answer[graphData.answerShown].p,
      graphData.answer[graphData.answerShown].q);
    graphData.data.text = "Alternate Solution"
    forceUpdate();
  };

  const reposListProps = {
    loading,
    error,
    repos,
  };

  const drawAlternate = function() {

    graphData.answerShown = (graphData.answerShown + 1 ) % graphData.answer.length 

    drawGraph(graphData.data.points, graphData.answer[graphData.answerShown].links,
      graphData.answer[graphData.answerShown].p,
      graphData.answer[graphData.answerShown].q);
    forceUpdate();    
  }

  // the graph configuration, you only need to pass down properties
  // that you want to override, otherwise default ones will be used
  const myConfig = {
    nodeHighlightBehavior: true,
    node: {
      color: 'black',
      size: 10,
      highlightStrokeColor: 'blue',
    },
    link: {
      highlightColor: 'lightblue',
    },
  };


  const result = [];
  const previousCount = 0;

  const graphAlgorthmRunner = function(input) {
    const sortedGraphCoordinates = input.sort(function(a, b) {
      if (a.x > b.x) {
        return -1;
      }
      if (b.x > a.x) {
        return 1;
      }
      return 0;
    });

    let result = [];
    let count = 0;
    tableTForOneTriple= {};
    tableUForOneTriple = {};
    tableCForOneTriple = {};
    tableTForThreeTriple = {};
    tableUForThreeTriple = {};
    tableCForThreeTriple = {};
    for (let pIndex = 0; pIndex < sortedGraphCoordinates.length; pIndex++) {
      const p = sortedGraphCoordinates[pIndex];
      const qResult = [];
      const qCount = 0;
      for (let qIndex = 0; qIndex < pIndex; qIndex++) {
        const q = sortedGraphCoordinates[qIndex];
        if (q.y < p.y) {
          continue;
        }

        let overlapCount = p==q ? 1 : 2

        const oneTripleResultForQ = oneTripleStaircase(
          p,
          q,
          sortedGraphCoordinates,
        );
        const threeTripleResultForQ = threeTripleStaircase(
          p,
          q,
          sortedGraphCoordinates,
        );
      
        const links = oneTripleResultForQ[1].concat(threeTripleResultForQ[1]);
        const countForPQ = oneTripleResultForQ[0] + threeTripleResultForQ[0] - overlapCount

        if (
          oneTripleResultForQ[1] &&
          count < countForPQ
        ) {
          count = countForPQ
          result = []
          result.push({p, q, links});
        }
        else if (
          oneTripleResultForQ[1] &&
          count == countForPQ
          ){
          result.push({p, q, links})
        }
      }
    }
    graphData.data.count = count;
    return result;
  };


  const oneTripleStaircase = function(p, q, input) {
    const modifiedInput = input.filter(coordinate => coordinate.x > p.x);

    if([p.x, p.y, q.x, q.y] in tableTForOneTriple)
    {
      return tableTForOneTriple[[p.x, p.y, q.x, q.y]]
    }

    let resultLinks = [];
    let resultCount;

    for (const rCoordinate of modifiedInput){
      const rType = rTypeMethodForOneTripleStaircase(p, q, rCoordinate);
      let linksForR = []; 
      let countForR = 0; 

      if (rType == 1)  // Case Rp\q
      {
        let typeA;
        if([p.x, p.y, rCoordinate.x, rCoordinate.y] in tableTForOneTriple){
          typeA = tableTForOneTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
          typeA = oneTripleStaircase(
          p,
          rCoordinate,
          modifiedInput
          );
          tableTForOneTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]] = typeA
        }

        linksForR.push({ source: q, target: rCoordinate, type: rType});
        countForR = 1 + typeA[0] 
        linksForR = linksForR.concat(typeA[1])
      } 
      else if (rType == 2) //Case Cp,q
      {
        let typeB;
        if([rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y] in tableCForOneTriple ){
          typeB = tableCForOneTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
          const pq = modifiedInput.filter(
          coordinate =>
            coordinate.x > rCoordinate.x &&
            coordinate.y > rCoordinate.y &&
            coordinate.y <= q.y &&
            coordinate.x <= q.x,
        );
          typeB = twoStaircase(rCoordinate, p, q, pq, rType);
        }
        tableCForOneTriple[[p.x,p.y, q.x, q.y]] = typeB
        countForR = typeB[0] 
        linksForR = linksForR.concat(typeB[1])
      } 

      else if (rType == 3) // Case Rq\p
      {
        let typeC;
        if([rCoordinate.x, rCoordinate.y, q.x, q.y] in tableTForOneTriple){
          typeC = tableTForOneTriple[[rCoordinate.x, rCoordinate.y, q.x, q.y]]
        }
        else{
          typeC = oneTripleStaircase(
                    rCoordinate,
                    q,
                    modifiedInput,
                  );
          tableTForOneTriple[[rCoordinate.x, rCoordinate.y, q.x, q.y]] = typeC
        }

        linksForR.push({ source: p, target: rCoordinate, type: rType });
        countForR = 1 + typeC[0] 
        linksForR = linksForR.concat(typeC[1])
        
      }
       else if (rType == 4) // Case Rp,q 
       {
        let alphaPQ;

        if (p==q)
        {
          alphaPQ = 1;
          linksForR.push({ source: p, target: rCoordinate, type: rType });
        }

        else if (p != q) 
        {
          alphaPQ = 2;
          linksForR.push({ source: p, target: rCoordinate, "q": q, type: 5 }); // Type5 refers to visualization function used 
        }

        let typeD;

        if([rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y] in tableTForOneTriple){
          typeD = tableTForOneTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
          typeD= oneTripleStaircase(
          rCoordinate,
          rCoordinate,
          modifiedInput,
        );
        }

        countForR = alphaPQ + typeD[0] 
        linksForR = linksForR.concat(typeD[1])
        tableTForOneTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]] = typeD

        let typeE // Case Up,r
        if([p.x, p.y, rCoordinate.x, rCoordinate.y] in tableUForOneTriple)
        {
          typeE = tableUForOneTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]];
        }

        else
        {
          const UPR = modifiedInput.filter(
            coord =>
              coord.x > rCoordinate.x && coord.y < p.y && coord.y > rCoordinate.y,
          );

          let resultCountForRS = 0;
          let resultLinksForRS = []

          for (const s of UPR)
           {
            if (rCoordinate == s) {
              continue;
            }

            let countForRS = 0;
            let linksForRS = [];

            linksForRS.push({ source: p, target: rCoordinate, type: 3 });
            linksForRS.push({ source: q, target: s, type: 1 });

            if([rCoordinate.x, rCoordinate.y, s.x, s.y] in tableTForOneTriple){
              typeE = tableTForOneTriple[[rCoordinate.x, rCoordinate.y, s.x, s.y]];
            }
            else{
              typeE = oneTripleStaircase(
              rCoordinate,
              s,
              modifiedInput,
            );
            }

            countForRS = alphaPQ + typeE[0] 
            linksForRS = linksForRS.concat(typeE[1])

            if (resultCountForRS < countForRS) 
            {
              resultCountForRS = countForRS;
              resultLinksForRS = linksForRS;
            }

            tableTForOneTriple[[rCoordinate.x, rCoordinate.y, s.x, s.y]] = typeE
          }

          if (countForR < resultCountForRS){
            countForR = resultCountForRS
            linksForR = resultLinksForRS
          }
          tableUForOneTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]] = [resultCountForRS, resultLinksForRS]
        }
      }

      if (resultCount == undefined || resultCount <= countForR) {
        resultCount = countForR
        resultLinks = linksForR
      }
    }

    tableTForOneTriple[[p.x, p.y, q.x, q.y]] = [resultCount, resultLinks]

    return [resultCount, resultLinks];
  };

    const threeTripleStaircase = function(p, q, input) 
  {
    let modifiedInput = input.filter(coordinate => coordinate.x <= q.x);

    if([p.x, p.y, q.x, q.y] in tableTForThreeTriple && tableTForThreeTriple[[p.x, p.y, q.x, q.y]] != undefined)
    {
      return tableTForThreeTriple[[p.x, p.y, q.x, q.y]]
    }
    if(p == q && modifiedInput.length == 0){
      return [1, []]
    }

    let resultLinks = [];
    let resultCount = 0;

    for (const rCoordinate of modifiedInput){
      const rType = rTypeMethodForThreeTripleStaircase(p, q, rCoordinate);
      let linksForR = []; 
      let countForR = 0; 

      if (rType == 1) 
      {
        let typeA;
        if([p.x, p.y, rCoordinate.x, rCoordinate.y] in tableTForThreeTriple){
          typeA = tableTForThreeTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
          typeA = threeTripleStaircase(
          p,
          rCoordinate,
          modifiedInput
          );
          tableTForThreeTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]] = typeA
        }

        linksForR.push({ source: q, target: rCoordinate, type: rType});
        countForR = 1 + typeA[0] 
        linksForR = linksForR.concat(typeA[1])
        
      } 

      else if (rType == 2.5) {
        let typeB;
        if([rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y] in tableCForThreeTriple ){
          typeB = tableCForThreeTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
        const pq = modifiedInput.filter(
          coordinate =>
            coordinate.x < rCoordinate.x &&
            coordinate.y > rCoordinate.y &&
            coordinate.y <= q.y &&
            coordinate.x <= q.x,
        );
          typeB = twoStaircase(rCoordinate, p, q, pq, rType);
        }
        tableCForThreeTriple[[p.x,p.y, q.x, q.y]] = typeB
        countForR = typeB[0] 
        linksForR = linksForR.concat(typeB[1])
      } 

      else if (rType == 3) 
      {
        let typeC;
        if([rCoordinate.x, rCoordinate.y, q.x, q.y] in tableTForThreeTriple){
          typeC = tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, q.x, q.y]]
        }
        else{
          typeC = threeTripleStaircase(
                    rCoordinate,
                    q,
                    modifiedInput,
                  );
          tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, q.x, q.y]] = typeC
        }

        linksForR.push({ source: p, target: rCoordinate, type: rType });
        countForR = 1 + typeC[0] 
        linksForR = linksForR.concat(typeC[1])
      }
       else if (rType == 4) 
       {

        let typeD;

        if([rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y] in tableTForThreeTriple){
          typeD = tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]]
        }
        else{
          typeD= threeTripleStaircase(
          rCoordinate,
          rCoordinate,
          modifiedInput,
        );
        }

        let alphaPQ = 1;
        if (p==q)
        {
          linksForR.push({ source: p, target: rCoordinate, type: rType });
        }

        else if (p != q) 
        {
          alphaPQ = 2;
          linksForR.push({ source: p, target: rCoordinate, "q": q, type: 5 });
        }

        countForR = alphaPQ + typeD[0] 
        linksForR = linksForR.concat(typeD[1])
        tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, rCoordinate.x, rCoordinate.y]] = typeD

        let typeE
        if([p.x, p.y, rCoordinate.x, rCoordinate.y] in tableUForThreeTriple)
        {
          typeE = tableUForThreeTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]];
        }

        else
        {
          const UPR = modifiedInput.filter(
          coord =>
            coord.x > rCoordinate.x && coord.y > q.y && coord.y > rCoordinate.y 
        );

          let resultCountForRS = 0;
          let resultLinksForRS = []

          for (const s of UPR)
           {
            if (rCoordinate == s) {
              continue;
            }

            let countForRS = 0;
            let linksForRS = [];

            linksForRS.push({ source: p, target: rCoordinate, type: 3 });
            linksForRS.push({ source: q, target: s, type: 1 });

            if([rCoordinate.x, rCoordinate.y, s.x, s.y] in tableTForThreeTriple){
              typeE = tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, s.x, s.y]];
            }
            else{
              typeE = threeTripleStaircase(
              rCoordinate,
              s,
              modifiedInput,
            );
            }

            countForRS = alphaPQ + typeE[0] 
            linksForRS = linksForRS.concat(typeE[1])

            if (resultCountForRS < countForRS) 
            {
              resultCountForRS = countForRS;
              resultLinksForRS = linksForRS;
            }

            tableTForThreeTriple[[rCoordinate.x, rCoordinate.y, s.x, s.y]] = typeE
          }

          if (countForR < resultCountForRS){
            countForR = resultCountForRS
            linksForR = resultLinksForRS
          }
          tableUForThreeTriple[[p.x, p.y, rCoordinate.x, rCoordinate.y]] = [resultCountForRS, resultLinksForRS]
        }
      }

      if (resultCount == undefined || resultCount <= countForR) {
        resultCount = countForR
        resultLinks = linksForR
      }
    }

    tableTForThreeTriple[[p.x, p.y, q.x, q.y]] = [resultCount, resultLinks]

    return [resultCount, resultLinks];
  };

    const twoStaircase = function(r, p, q, nodes, type) {
    let resultLinks = [];
    let count = 0;
    const dfs = function(r, p, q, input, links) {
      links = Array.from(links);
      links.push({ source: p, target: r, type });

      if (r == q) {
        if (resultLinks.length < links.length) {
          resultLinks = links;
        }
      }
      for (const coordinate of input) {
        const newInput = input.filter(
          coord => coord.x > coordinate.x && coord.y < coordinate.y,
        );
        dfs(coordinate, r, q, newInput, links);
      }
    };
    dfs(r, p, q, nodes, []);
    return [resultLinks.length + 1, resultLinks];
  };


  const rTypeMethodForThreeTripleStaircase = function(p, q, r) {

    if (r.y > p.y && r.x > p.x && r.x <= q.x && r.y <= q.y) {
      return 2.5; //2.5 is used to deal with drawing appropriate staircase. 
    }
    if (r && q && r.y > p.y && r.x < p.x && r.y < q.y) {
      return 3;
    }  
    if (r.y > q.y && r.x < p.x) {
      return 4;
    }
    if (r.x < q.x && r.y > q.y && r.x > p.x) {
      return 1;
    }

    return 5;
  };

  const rTypeMethodForOneTripleStaircase = function(p, q, r) {
    if (r.y >= p.y && r.x <= q.x && r.y <= q.y) {
      return 2;
    }
    if (r.y < p.y && r.x < q.x && r.y <q.y) {
      return 3;
    }
    if (r.x > q.x && p.y < r.y && q.y > r.y) {
      return 1;
    }
    if (r.y < p.y && r.x > q.x) {
      return 4;
    }

    return 5;
  };

  const drawGraph = function(nodes, links, p, q) {
    // nodes has all nodes in the graph
    // links will define which nodes are connected
    let newNodes = [];
    const drawLinksOne = [];
    const drawLinksTwo = [];
    const drawLinksTwoReverse = [];
    const drawLinksThree = [];
    const drawLinksFour = [];


    for (const node of nodes) {

      let color = "black"
      if (node == q || node == p){
        color = 'lightgreen'
      }
      const setUUID = uuid();
      const tempNode = {
        id: setUUID,
        fx: node.x,
        fy: node.y,
        fontColor: 'transparent',
        fontSize: 0,
        size: 50,
        color: color
      };

      newNodes.push(tempNode);
    }

    for (var link of links) {
      const sourceID = newNodes.filter(
        sourceID =>
          sourceID.fx == link.source.x && sourceID.fy == link.source.y,
      )[0];
      const targetID = newNodes.filter(
        targetID =>
          targetID.fx == link.target.x && targetID.fy == link.target.y,
      )[0];
      const tempLink = { source: sourceID.id, target: targetID.id };

      if (link.type == 1) {
        drawLinksOne.push(tempLink);
      } else if (link.type == 2) {
        drawLinksTwo.push(tempLink);
      } else if (link.type == 2.5) {
        drawLinksTwoReverse.push(tempLink);
      } else if (link.type == 4) {
        drawLinksFour.push(tempLink);
      } else if (link.type ==5){

        if (!("q" in link || "p" in link || rCoordinate in link)){
          continue;
        }

        let q = newNodes.filter(
          intermediate =>
            "q" in link && intermediate.fx == link.q.x && intermediate.fy == link.q.y,
        )[0];

        let intermediateNode;
        let newUuid = uuid();
        if (link.source.y > link.target.y){
          intermediateNode = {
                    id: newUuid,
                    fx: link.q.x,
                    fy: link.source.y,
                    fontColor: 'transparent',
                    fontSize: 0,
                    size: 1,
                  };
        }

        else{
          intermediateNode = {
                    id: newUuid,
                    fx: link.source.x,
                    fy: link.q.y,
                    fontColor: 'transparent',
                    fontSize: 0,
                    size: 1,
                  };
        }

        newNodes.push(intermediateNode)

        const tempLink1 = { source: sourceID.id, target: intermediateNode.id ,color: "red", opacity:"0.2"};
        const tempLink2 = { source: q.id, target: intermediateNode.id ,color: "red",opacity:"0.2"};
        const tempLink3 = { source: intermediateNode.id, target: targetID.id, color: "red" ,opacity:"0.2"};
        drawLinksFour.push(tempLink1);
        drawLinksFour.push(tempLink2);
        drawLinksFour.push(tempLink3);

      }

      else {
        drawLinksThree.push(tempLink);
      }
    }
    newNodes = transformCoords(newNodes,p, q);
    graphData.data.nodes = newNodes;
    drawNodes(graphData.data.nodes);
    drawReverseTwoStair(newNodes, drawLinksTwoReverse);
    drawOneStair(newNodes, drawLinksOne);
    drawTwoStair(newNodes, drawLinksTwo);
    drawThreeStair(newNodes, drawLinksThree);
    drawType4(newNodes, drawLinksFour);
  };

  const drawNodes = function(nodes) {
    graphData.data.links = []
    for (const node of nodes) {
      const link = { source: node.id, target: node.id };
      graphData.data.links.push(link);
    }
  };

  const drawOneStair = function(nodes, links) {
    // console.log("look below")
    // console.log(links)

    // iterate the links to connect nodes
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;

      let sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      let targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes
        // check which node has the higher y value - should be the SOURCE
        if (sourceCoordinate.fy > targetCoordinate.fy) {
          // switch the two points
          const tempVar = targetCoordinate;
          targetCoordinate = sourceCoordinate;
          sourceCoordinate = tempVar;
        }

        // invisible node will have the same x coordinate as source and same y coordinate as target
        const newUUID = uuid();
        const newNode = {
          id: newUUID,
          fx: sourceCoordinate.fx,
          fy: targetCoordinate.fy,
          size: 1,
          fontColor: 'transparent',
          fontSize: 0,
        };
        graphData.data.nodes.push(newNode);

        let newLink = { source: sourceNode, target: newUUID, color: 'Tomato'};
        graphData.data.links.push(newLink);
        newLink = { source: newUUID, target: targetNode, color: 'Tomato' };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
  };

  const drawType4 = function(nodes, links) {
    // console.log("look below")
    // console.log(links)

    // iterate the links to connect nodes
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;

      const sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      const targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        const newLink = {
          source: sourceNode,
          target: targetNode,
          color: 'red',
          opacity: 0.2,
        };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
  };

  const drawType5 = function(nodes, links) {
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;

      const sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      const targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        const newLink = {
          source: sourceNode,
          target: targetNode,
          color: 'red',
          opacity: 0.2,
        };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
  };

  const drawReverseTwoStair = function(nodes, links) {
    // iterate the links to connect nodes
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;

      let sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      let targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes
        // check which node has the higher y value - should be the TARGET
        if (sourceCoordinate.fy < targetCoordinate.fy) {
          // switch the two points
          const tempVar = targetCoordinate;
          targetCoordinate = sourceCoordinate;
          sourceCoordinate = tempVar;
        }

        // invisible node will have the same y coordinate as source and same x coordinate as target
        const newUUID = uuid();
        const newNode = {
          id: newUUID,
          fx: sourceCoordinate.fx,
          fy: targetCoordinate.fy,
          size: 1,
          fontColor: 'transparent',
          fontSize: 0,
        };
        graphData.data.nodes.push(newNode);

        let newLink = { source: sourceNode, target: newUUID, color: 'Tomato' };
        graphData.data.links.push(newLink);
        newLink = { source: newUUID, target: targetNode, color: 'Tomato' };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
    // display on graph
  };

  const drawTwoStair = function(nodes, links) {
    // iterate the links to connect nodes
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;

      let sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      let targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes
        // check which node has the higher y value - should be the TARGET
        if (sourceCoordinate.fy < targetCoordinate.fy) {
          // switch the two points
          const tempVar = targetCoordinate;
          targetCoordinate = sourceCoordinate;
          sourceCoordinate = tempVar;
        }

        // invisible node will have the same y coordinate as source and same x coordinate as target
        const newUUID = uuid();
        const newNode = {
          id: newUUID,
          fx: targetCoordinate.fx,
          fy: sourceCoordinate.fy,
          size: 1,
          fontColor: 'transparent',
          fontSize: 0,
        };
        graphData.data.nodes.push(newNode);

        let newLink = { source: sourceNode, target: newUUID, color: 'Tomato' };
        graphData.data.links.push(newLink);
        newLink = { source: newUUID, target: targetNode, color: 'Tomato' };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
    // display on graph
  };

  const drawThreeStair = function(nodes, links) {
    // iterate the links to connect nodes
    for (const l of links) {
      var sourceNode = l.source;
      var targetNode = l.target;
      let sourceCoordinate = nodes.filter(
        sourcePoint => sourcePoint.id == sourceNode,
      )[0];
      let targetCoordinate = nodes.filter(
        targetPoint => targetPoint.id == targetNode,
      )[0];

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes
        // check which node has the higher y value - should be the TARGET
        if (sourceCoordinate.fy < targetCoordinate.fy) {
          // switch the two points
          const tempVar = targetCoordinate;
          targetCoordinate = sourceCoordinate;
          sourceCoordinate = tempVar;
        }

        // invisible node will have the same y coordinate as source and same x coordinate as target
        const newUUID = uuid();
        const newNode = {
          id: newUUID,
          fx: sourceCoordinate.fx,
          fy: targetCoordinate.fy,
          size: 1,
          fontColor: 'transparent',
          fontSize: 0,
        };
        graphData.data.nodes.push(newNode);

        let newLink = { source: sourceNode, target: newUUID, color: 'Tomato' };
        graphData.data.links.push(newLink);
        newLink = { source: newUUID, target: targetNode, color: 'Tomato' };
        graphData.data.links.push(newLink);
      } else {
        graphData.data.links.push(l);
      }
    }
  };

  const transformCoords = function(nodes, p, q) {

    // function that orients graph output with (0,0) in the centre
    // coordinates are given on smaller scale and assumes (0,0) is in the centre

    // find mid-point of x-values to determine how much to shift axis by
    const xMax = Math.max(...nodes.map(point => point.fx));
    const xMin = Math.min(...nodes.map(point => point.fx));
    const xCenter = (xMax - xMin) / 2;

    // find maximum y-value to determine upper boundary
    let yMax = Math.max(...nodes.map(point => point.fy));
    let yMin = Math.max(...nodes.map(point => point.fy));
    let yCenter = (yMax - yMin) / 2;

    const scale = 100 / nodes.length;

    // move center to center of graph (400,200)
    for (const coords of nodes) {
      // if((coords.x == p.x && coords.y == p.y) || (coords.x == q.x && coords.y == q.y)){
      //   coords.color = 'red'
      // }
      // set xCenter and yCenter to (0,0) - shift other points
      const yDiff = coords.fy - yCenter; // move all y values up (smaller y value)
      coords.fy = yDiff * scale + (150 - yCenter * scale);

      const xDiff = coords.fx - xCenter; // move all x values to the left (smaller x value)
      coords.fx = xDiff * scale + (250 - xCenter * scale);

      
    }
    // flip the y-values (smaller y-values represent higher position on graph)
    yMax = Math.max(...nodes.map(point => point.fy));
    yMin = Math.max(...nodes.map(point => point.fy));
    yCenter = (yMax - yMin) / 2;
    for (const yval of nodes) {
      const yDiff = yMax - yval.fy;
      yval.fy = yDiff + (150 - yCenter * scale);
    }
    return nodes;

    // take the distance between y-mid and all y-values
  };
  const transformYVals = function(nodes) {
    // find the difference between max y-coordinate with all other coordinates
    const maxVal = Math.max(...nodes.map(point => point.fy));
    for (const yval of nodes) {
      const diff = maxVal - yval.fy;
      yval.fy = diff + 20;
    }
    // changes are directly applied to nodes
    return nodes;
  };

  const onClickNode = function(nodeId) {
    // window.alert(`Clicked node ${nodeId}`);
  };

  const onDoubleClickNode = function(nodeId) {
    console.log(nodeId);
    // window.alert(`Double clicked node ${nodeId}`);
  };

  const onRightClickNode = function(event, nodeId) {
    // window.alert(`Right clicked node ${nodeId}`);
    console.log(event);
  };

  const onMouseOverNode = function(nodeId) {
    // window.alert(`Mouse over node ${nodeId}`);
  };

  const onMouseOutNode = function(nodeId) {
    // window.alert(`Mouse out node ${nodeId}`);
  };

  const onClickLink = function(source, target) {
    // window.alert(`Clicked link between ${source} and ${target}`);
  };

  const onRightClickLink = function(event, source, target) {
    // window.alert(`Right clicked link between ${source} and ${target}`);
  };

  const onMouseOverLink = function(source, target) {
    // window.alert(`Mouse over in link between ${source} and ${target}`);
  };

  const onMouseOutLink = function(source, target) {
    // window.alert(`Mouse out link between ${source} and ${target}`);
  };

  const onNodePositionChange = function(nodeId, x, y) {
    // window.alert(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
  };

  const setPointNumber = function(number){
    graphData.data.numberOfPoints = number
  }

  const updateValue = function(number){
    console.log(number.target.value);
    graphData.data.numberOfPoints = parseInt(number.target.value)
  }

  return (
    <article>
      <Helmet>
        <title>Home Page</title>
        <meta
          name="description"
          content="A React.js Boilerplate application homepage"
        />
      </Helmet>

      <Header>
      </Header>


      <br />
      <Card>
            <Card.Img variant="top" src={Banner} />
            <Card.Body>
              <Button variant="primary" href="http://www.eurocg2019.uu.nl/papers/17.pdf">Link to Paper</Button>
              <Card.Text>
                Click the link above to read about the MaxRCH and other similar algorithms
              </Card.Text>
            </Card.Body>
          </Card>
      <br />

    <InputGroup className="mb-3"  >

      <InputGroup.Prepend >
        <Button variant="secondary" size="md" active onClick={createPoints}>Randomize Points</Button>
      </InputGroup.Prepend>  
      <FormControl
        placeholder="20"
        aria-label="20"
        aria-describedby="basic-addon2"
        onChange = {updateValue}

      />      
    </InputGroup>

    <Jumbotron >

        <ButtonGroup className="mr-2" aria-label="First group">

          <Button variant="outline-primary" size="lg" active onClick={graphData.data.text == "Run Algorithm" ? runAndDraw :drawAlternate}>{graphData.data.text}</Button>
        </ButtonGroup>

      <Badge variant="info">Count: {graphData.data.count}</Badge>   

      <Graph
        id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
        data={graphData.data}
        config={myConfig}
        onClickNode={onClickNode}
        onDoubleClickNode={onDoubleClickNode}
        onRightClickNode={onRightClickNode}
        onClickLink={onClickLink}
        onRightClickLink={onRightClickLink}
        onMouseOverNode={onMouseOverNode}
        onMouseOutNode={onMouseOutNode}
        onMouseOverLink={onMouseOverLink}
        onMouseOutLink={onMouseOutLink}
        onNodePositionChange={onNodePositionChange}
      />      
    </Jumbotron>



    </article>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
  onChangeData: PropTypes.func,
  graphData: PropTypes.object,
  T: PropTypes.object,
  U: PropTypes.object,
  CTable: PropTypes.object
};

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  graphData: makeSelectData(),
  T: makeSelectTableT(),
  U: makeSelectTableU(),
  CTable: makeSelectTableC(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onChangeData: graph => dispatch(changeData(graph)),
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
