/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo, useState } from 'react';
import {Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2} from 'react-sigma';
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
import ReposList from 'components/ReposList';
import AtPrefix from './AtPrefix';
import CenteredSection from './CenteredSection';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';
import { loadRepos } from '../App/actions';
import { changeUsername, changeData } from './actions';
import { makeSelectUsername, makeSelectData, makeSelectAnswer } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { Graph, Link } from "react-d3-graph";
import Button from 'components/Button';
const uuid = require('uuid/v4');

const key = 'home';

function useForceUpdate(){
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
  answer
}) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  useEffect(() => {
    // When initial state username is not null, submit the form to load repos
    if (username && username.trim().length > 0) onSubmitForm();
  }, []);

  const forceUpdate = useForceUpdate();

  const draw = function(){
    var sampleCoordinates1 = [{x:-19, y: 17},{x:-11, y: 20},{x:-8, y: 12}, {x:-5, y: 8}, {x:1,y:1}, {x:2, y:0}, {x: 5, y: 5}, {x:6.5, y:4}, {x:6, y:15}, {x:9, y:5}, {x:8, y:14}, {x:10, y:3}, {x:11, y:4}, {x: 13, y:6}, {x:15, y:8}, {x:17, y:12}, {x: 16, y:10}, {x:18, y: 5}, {x:20, y:7}, {x:25, y:-10}, {x:27, y:-15}, {x:30, y:-20}, {x:32, y:-12}]
    var sampleCoordinates2 = [{x:1,y:1}, {x:4, y:13}, {x: 7, y:-1},{x: 9, y:-4},{x: 11, y:-7},{x: 13, y:-9},{x: 15, y:-11},{x: 17, y:-13},{x: 19, y:-15},{x: 21, y:-17},{x: 23, y:-19},{x: 25, y:-25}, {x:28, y:-22}]

    var testCoordinates = [{fx:200,fy:203.5},
                              {fx:201,fy:203.5},
                              {fx:201,fy:203},
                              {fx:202,fy:203},
                              {fx:202,fy: 202.5},
                              {fx:203,fy:202.5},
                              {fx:203,fy:202},
                              {fx:205,fy:202},
                              {fx:205,fy:200},
                              {fx:205.5,fy:201.5},
                              {fx:205.5,fy:203},
                              {fx:206,fy:203},
                              {fx:206,fy:204},
                              {fx:206.25,fy:204},
                              {fx:207,fy:204},
                              {fx:206.25,fy:205},
                              {fx:205,fy:205},
                              {fx:205,fy:205.5},
                              {fx:203.5,fy:205.5},
                              {fx:203.5,fy:206},
                              {fx:200,fy:206}]

      var test = graphAlgorthmRunner(sampleCoordinates1)
      console.log(test)
      
      drawGraph(sampleCoordinates1, test)
      forceUpdate()
  }


  const reposListProps = {
    loading,
    error,
    repos,
  };

  // the graph configuration, you only need to pass down properties
  // that you want to override, otherwise default ones will be used
  const myConfig = {
      nodeHighlightBehavior: true,
      node: {
          color: "lightgreen",
          size: 120,
          highlightStrokeColor: "blue",
      },
      link: {
          highlightColor: "lightblue",
      },
  };

 var sampleCoordinates = [{x: 5, y: 5}, {x:6, y:4}, {x:7, y:3}, {x:11, y:9}, {x: 10, y:10}]
 
  var result = []
  var previousCount = 0

  const twoStaircase = function(r, p, q, nodes, type){
    let resultLinks = []
    let count = 0 
    const dfs = function(r, p, q, input, links){
      links = Array.from(links)
      links.push({"source": p, "target": r, "type": type});

      if( r == q){
        // console.log(links)
        if (resultLinks.length < links.length){
          resultLinks = links;
        }
      }
      for(let coordinate of input){
        let newInput = input.filter(coord => coord.x > coordinate.x && coord.y < coordinate.y)
        dfs(coordinate, r, q, newInput, links)
      }
    }
    dfs(r,p, q, nodes, [])
    return resultLinks
  }

  const graphAlgorthmRunner = function(input){
    var sortedGraphCoordinates = input.sort(function(a,b){
      if (a.x > b.x){
        return -1;
      }
      if (b.x > a.x){
        return 1
      }
      return 0
    })
    var result = []
    var count = 0
    for(let pIndex = 0 ; pIndex < sortedGraphCoordinates.length; pIndex ++){
      let p = sortedGraphCoordinates[pIndex];
      let qResult = [];
      let qCount = 0; 
      for(let qIndex=0; qIndex< pIndex; qIndex++){
          let q = sortedGraphCoordinates[qIndex]
          if(q.y < p.y){
            continue;
          }
          let threeTripleResultForQ= threeTripleStaircase(0, p, q, sortedGraphCoordinates, [])
          let oneTripleResultForQ = oneTripleStaircase(0, p, q, sortedGraphCoordinates, [])
          console.log(threeTripleResultForQ)
          let links = oneTripleResultForQ[1].concat(threeTripleResultForQ[1])
          if (threeTripleResultForQ[1] && oneTripleResultForQ[1] && links.length > result.length){
            result = links;
          }
        }
    }
    console.log(result)
    return result;
  }

  const threeTripleStaircase = function(previous, p, q, input, links){
    let modifiedInput = input.filter(coordinate => {
      return coordinate.x <= q.x
    })

    let count = previous
    let result = links
    let twoStaircaseLinks;

    for(let rCoordinate of modifiedInput){
      let rType = rTypeMethodForThreeTripleStaircase(p, q, rCoordinate)
      let type1;
      let type2;
      let type3;
      let type4;
      let type5;
      let modifiedLinks = Array.from(links);
      if (rType == 1){
        modifiedLinks.push({"source": q, "target": rCoordinate, "type": rType})
        type1 = threeTripleStaircase(previous + 1, p, rCoordinate, modifiedInput, modifiedLinks)
      }
      else if(rType == 2.5){
        let pq = modifiedInput.filter(coordinate => coordinate.x < rCoordinate.x && coordinate.y > rCoordinate.y && coordinate.y <= q.y && coordinate.x <= q.x)
        let result = twoStaircase(rCoordinate,p, q, pq, rType)
        let resultCopy = Array.from(result)
        type2 = [previous + result.length -1 , [...modifiedLinks, ...result]]
      }
      else if(rType ==3){
        modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
        type1 = threeTripleStaircase(previous + 1, rCoordinate, q, modifiedInput, modifiedLinks)   
      }
      else if(rType == 4){
        modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
        if (p!=q){
          modifiedLinks.push({"source": q, "target": rCoordinate, "type": rType})
        }       
        type4 = threeTripleStaircase(previous + 1, rCoordinate, rCoordinate, modifiedInput, modifiedLinks);
        let UPR = modifiedInput.filter(coord => coord.x > q.x && coord.x > rCoordinate.x && coord.y > rCoordinate.y);
        let countForS = 0
        let resultForS = []
        for(let s of UPR){
          modifiedLinks = Array.from(links);
          if (rCoordinate == s){
            continue
          }
          modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
          modifiedLinks.push({"source": q, "target": s, "type": rType})
          let result = threeTripleStaircase(previous + 2, rCoordinate, s, modifiedInput, modifiedLinks)
           
          if (countForS < result[0]){
            resultForS = result[1]
            countForS = result[0]
          }
          type5 = [countForS, resultForS]
        }
      }
      let resultForR = [type1 , type2 , type3, type4 , type5].sort(function(a,b){
        return b[1].length - a[1].length
      })[0]
      if (resultForR && result.length < resultForR[1].length){
        count = resultForR[0]
        result = resultForR[1]
      }
    }
    return [count, result]
  }

  const oneTripleStaircase = function(previous, p, q, input, links) {
    let modifiedInput = input.filter(coordinate => {
      return coordinate.x > p.x
    })
    let count = previous
    let result = links
    let twoStaircaseLinks;

    for(let rCoordinate of modifiedInput){
      let rType = rTypeMethodForOneTripleStaircase(p, q, rCoordinate)
      let type1;
      let type2;
      let type3;
      let type4;
      let type5;
      let modifiedLinks = Array.from(links);
      if (rType == 1){
        modifiedLinks.push({"source": q, "target": rCoordinate, "type": rType})
        type1 = oneTripleStaircase(previous + 1, p, rCoordinate, modifiedInput, modifiedLinks)
      }
      else if(rType == 2){
        let pq = modifiedInput.filter(coordinate => coordinate.x > rCoordinate.x && coordinate.y > rCoordinate.y && coordinate.y <= q.y && coordinate.x <= q.x)
        let result = twoStaircase(rCoordinate,p, q, pq, rType)
        type2 = [previous + result.length, [...modifiedLinks, ...result]]
      }
      else if(rType ==3){
        modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
        type1 = oneTripleStaircase(previous + 1, rCoordinate, q, modifiedInput, modifiedLinks)   
      }
      else if(rType == 4){
        modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
        if (p!=q){
          modifiedLinks.push({"source": q, "target": rCoordinate, "type": rType})
        }
        type4 = oneTripleStaircase(previous + 1, rCoordinate, rCoordinate, modifiedInput, modifiedLinks);
        let UPR = modifiedInput.filter(coord => coord.x > rCoordinate.x && coord.y < p.y && coord.y > rCoordinate.y);
        let countForS = 0
        let resultForS = []
        for(let s of UPR){
          modifiedLinks = Array.from(links);
          if (rCoordinate == s){
            continue
          }
          modifiedLinks.push({"source": p, "target": rCoordinate, "type": rType})
          modifiedLinks.push({"source": q, "target": s, "type": rType})
          let result = oneTripleStaircase(previous + 2, rCoordinate, s, modifiedInput, modifiedLinks)
          if (countForS < result[0]){
            resultForS = result[1]
            countForS = result[0]
          }
          type5 = [countForS, resultForS]
        }
      }
      let resultForR = [type1 , type2 , type3, type4 , type5].sort(function(a,b){
        return b[0] - a[0]
      })[0]

      if (resultForR && count < resultForR[0]){
        count = resultForR[0]
        result = resultForR[1]
      }
    }
    return [count, result]
  }

  const rTypeMethodForThreeTripleStaircase = function(p, q, r){
    if(r.y > p.y && r.x <= q.x && r.y <= q.y){
      return 2.5
    }
    else if (r.y > p.y && r.x < p.x && r.y < q.y){
      return 3
    }
    else if(r.x < q.x && r.y > q.y && r.x > p.x && r.y > p.y){
      return 1
    }
    else if(r.y > q.y && r.x < p.x){
      return 4
    }
    else{
      return 5
    }
  }

  const rTypeMethodForOneTripleStaircase = function(p, q, r){
    if(r.y > p.y && r.x <= q.x && r.y <= q.y){
      return 2
    }
    else if (r.y < p.y && r.x < q.x){
      return 3
    }
    else if(r.x > q.x && p.y < r.y && q.y > r.y){
      return 1
    }
    else if(r.y < p.y && r.x > q.x){
      return 4
    }
    else{
      return 5
    }
  }



  const caseA = function(pIndex, qIndex, input) {
    let newInput = input.slice(pIndex, input.length)
    newInput.forEach((item, index) => {

    })
  }

  const caseB = function() {

  }

  const caseC = function() {

  }

  const caseD = function() {

  }

  const caseE = function() {

  }

    // graph event callbacks
  const onClickGraph = function() {
    

      // window.alert(`Clicked the graph background`);

      // graphData.data.nodes.push({ id: "John", fx:250, fy:300})
      // graphData.data.links.push({source:"John", target: "John"})
      // setTimeout(function(){
      //   graphData.data.links.push({source:"John", target: "Alice"})
      //   onChangeData(Object.assign({}, graphData))
      // }, 2000)



      
      // onChangeData(Object.assign({}, graphData))

      // var testNodes = [{x: 5, y: 5}, {x:6, y:4}, {x:7, y:3}, {x:11, y:9}, {x: 10, y:10}]


      //drawTwoStair([ {id: "Harry", fx:450,fy:250}, { id: "Sally", fx:400,fy:200}, { id: "Alice", fx:500,fy:400 }],[{ source: "Harry", target: "Sally" }, { source: "Harry", target: "Alice" }])
      //drawTwoStair()
      //drawThreeStair()
      

      // var newNodes = transformCoords([ {id: "a", fx:5,fy:5}, { id: "b", fx:6,fy:4}, { id: "c", fx:7,fy:3 }, { id: "d", fx:8,fy:2 }, { id: "e", fx:9,fy:1 }])
      // drawOneStair(newNodes,[{ source: "a", target: "b" }, { source: "b", target: "c" }, { source: "c", target: "d" }, { source: "d", target: "e" }])

  };

  const drawGraph = function (nodes, links) {
    // nodes has all nodes in the graph 
    // links will define which nodes are connected 
    var newNodes = []
    var drawLinksOne = []
    var drawLinksTwo = []
    var drawLinksTwoReverse = []
    var drawLinksThree = []
    var drawLinksFour = []

    for (var node of nodes) {
      var setUUID = uuid()
      var tempNode = {id: setUUID, fx: node.x, fy: node.y,fontColor: "transparent", fontSize:0, size: 50}

      newNodes.push(tempNode)
    }
  
    for (var link of links) {
      var sourceID = newNodes.filter(sourceID => sourceID.fx == link.source.x && sourceID.fy == link.source.y)[0]
      var targetID = newNodes.filter(targetID => targetID.fx == link.target.x && targetID.fy == link.target.y)[0]
      var tempLink = {source: sourceID.id, target: targetID.id}
      
      if (link.type == 1) {
        drawLinksOne.push(tempLink)
      } else if (link.type ==2) {
        drawLinksTwo.push(tempLink)
      } else if (link.type == 2.5){
        drawLinksTwoReverse.push(tempLink)
      }else if (link.type == 4){
        drawLinksFour.push(tempLink)
      }
      else {
        drawLinksThree.push(tempLink)
      }
    }
    newNodes = transformCoords(newNodes) 
    graphData.data.nodes = newNodes;
    drawNodes(graphData.data.nodes)
    drawReverseTwoStair(newNodes, drawLinksTwoReverse)
    drawOneStair(newNodes, drawLinksOne)
    drawTwoStair(newNodes, drawLinksTwo)
    drawThreeStair(newNodes, drawLinksThree)
    drawType4(newNodes, drawLinksFour)
  }

  const drawNodes = function(nodes){
    for(let node of nodes){
      var link = {source: node.id, target: node.id}
      graphData.data.links.push(link)
    }

  }

  const drawOneStair = function(nodes, links) {    
    // console.log("look below")
    // console.log(links)
    
    // iterate the links to connect nodes
    for (const l of links) {

      var sourceNode = l.source
      var targetNode = l.target
      
      var sourceCoordinate = nodes.filter(sourcePoint => sourcePoint.id == sourceNode) [0]
      var targetCoordinate = nodes.filter(targetPoint => targetPoint.id == targetNode) [0]

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes 
        // check which node has the higher y value - should be the SOURCE 
        if (sourceCoordinate.fy > targetCoordinate.fy) {
          //switch the two points
          var tempVar = targetCoordinate
          targetCoordinate = sourceCoordinate
          sourceCoordinate = tempVar
        }

        // invisible node will have the same x coordinate as source and same y coordinate as target
        var newUUID = uuid();
        var newNode = {id: newUUID, fx: sourceCoordinate.fx, fy: targetCoordinate.fy, size: 1, fontColor: "transparent", fontSize:0}
        graphData.data.nodes.push(newNode)

        var newLink = {source: sourceNode, target: newUUID, color:"black"}
        graphData.data.links.push(newLink)
        newLink = {source: newUUID, target: targetNode, color:"black"}
        graphData.data.links.push(newLink)
      } else {
        graphData.data.links.push(l)
      }
    }
  }

    const drawType4 = function(nodes, links) {    
    // console.log("look below")
    // console.log(links)
    
    // iterate the links to connect nodes
    for (const l of links) {

      var sourceNode = l.source
      var targetNode = l.target
      
      var sourceCoordinate = nodes.filter(sourcePoint => sourcePoint.id == sourceNode) [0]
      var targetCoordinate = nodes.filter(targetPoint => targetPoint.id == targetNode) [0]

      if (sourceCoordinate.fx != targetCoordinate.fx) {

        var newLink = {source: sourceNode, target: targetNode, color:"red", opacity:0.2}
        graphData.data.links.push(newLink)
      } else {
        graphData.data.links.push(l)
      }
    }
  }

  const drawReverseTwoStair = function(nodes, links) {
    // iterate the links to connect nodes
    for (const l of links) {

      var sourceNode = l.source
      var targetNode = l.target
      
      var sourceCoordinate = nodes.filter(sourcePoint => sourcePoint.id == sourceNode) [0]
      var targetCoordinate = nodes.filter(targetPoint => targetPoint.id == targetNode) [0]

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes 
        // check which node has the higher y value - should be the TARGET
        if (sourceCoordinate.fy < targetCoordinate.fy) {       
          //switch the two points
          var tempVar = targetCoordinate
          targetCoordinate = sourceCoordinate
          sourceCoordinate = tempVar
        }

        // invisible node will have the same y coordinate as source and same x coordinate as target
        var newUUID = uuid();
        var newNode = {id: newUUID, fx: sourceCoordinate.fx, fy: targetCoordinate.fy, size: 1, fontColor: "transparent", fontSize:0}
        graphData.data.nodes.push(newNode)

        var newLink = {source: sourceNode, target: newUUID, color:"black"}
        graphData.data.links.push(newLink)
        newLink = {source: newUUID, target: targetNode, color:"black"}
        graphData.data.links.push(newLink)
      } else {
        graphData.data.links.push(l)
      }

    }
    // display on graph
  }

  const drawTwoStair = function(nodes, links) {
    // iterate the links to connect nodes
    for (const l of links) {

      var sourceNode = l.source
      var targetNode = l.target
      
      var sourceCoordinate = nodes.filter(sourcePoint => sourcePoint.id == sourceNode) [0]
      var targetCoordinate = nodes.filter(targetPoint => targetPoint.id == targetNode) [0]

      if (sourceCoordinate.fx != targetCoordinate.fx) {
        // create an invisible point that will connect the two nodes 
        // check which node has the higher y value - should be the TARGET
        if (sourceCoordinate.fy < targetCoordinate.fy) {       
          //switch the two points
          var tempVar = targetCoordinate
          targetCoordinate = sourceCoordinate
          sourceCoordinate = tempVar
        }

        // invisible node will have the same y coordinate as source and same x coordinate as target
        var newUUID = uuid();
        var newNode = {id: newUUID, fx: targetCoordinate.fx, fy: sourceCoordinate.fy, size: 1, fontColor: "transparent", fontSize:0}
        graphData.data.nodes.push(newNode)

        
        var newLink = {source: sourceNode, target: newUUID, color:"black"}
        graphData.data.links.push(newLink)
        newLink = {source: newUUID, target: targetNode, color:"black"}
        graphData.data.links.push(newLink)
      } else {
        graphData.data.links.push(l)
      }

    }
    // display on graph
  }
  const drawThreeStair = function(nodes, links) {
  // iterate the links to connect nodes
    for (const l of links) {

    var sourceNode = l.source
    var targetNode = l.target
    
    var sourceCoordinate = nodes.filter(sourcePoint => sourcePoint.id == sourceNode) [0]
    var targetCoordinate = nodes.filter(targetPoint => targetPoint.id == targetNode) [0]

    if (sourceCoordinate.fx != targetCoordinate.fx) {
      // create an invisible point that will connect the two nodes 
      // check which node has the higher y value - should be the TARGET
      if (sourceCoordinate.fy < targetCoordinate.fy) {       
        //switch the two points
        var tempVar = targetCoordinate
        targetCoordinate = sourceCoordinate
        sourceCoordinate = tempVar
      }

      // invisible node will have the same y coordinate as source and same x coordinate as target
      var newUUID = uuid();
      var newNode = {id: newUUID, fx: sourceCoordinate.fx, fy: targetCoordinate.fy, size: 1, fontColor: "transparent", fontSize:0}
      graphData.data.nodes.push(newNode)

      
      var newLink = {source: sourceNode, target: newUUID, color:"black"}
      graphData.data.links.push(newLink)
      newLink = {source: newUUID, target: targetNode, color:"black"}
      graphData.data.links.push(newLink)
    } else {
      graphData.data.links.push(l)
    }

  }
}

  const transformCoords = function(nodes) {
    console.log(nodes)
    // function that orients graph output with (0,0) in the centre
    // coordinates are given on smaller scale and assumes (0,0) is in the centre

    // find mid-point of x-values to determine how much to shift axis by
    let xMax = Math.max(...nodes.map(point => point.fx))
    let xMin = Math.min(...nodes.map(point => point.fx))
    let xCenter = (xMax-xMin)/2

    // find maximum y-value to determine upper boundary 
    let yMax = Math.max(...nodes.map(point => point.fy))
    let yMin = Math.max(...nodes.map(point => point.fy))
    let yCenter = (yMax - yMin)/2

    let scale = 100/nodes.length

    //move center to center of graph (400,200)
    for(let coords of nodes){
      //set xCenter and yCenter to (0,0) - shift other points 
      let yDiff = coords.fy - yCenter // move all y values up (smaller y value)
      coords.fy = yDiff*scale+(150 - yCenter*scale)
      
      let xDiff = coords.fx - xCenter // move all x values to the left (smaller x value)
      coords.fx = xDiff*scale+(250 - xCenter*scale)
    }
    // flip the y-values (smaller y-values represent higher position on graph)
    yMax = Math.max(...nodes.map(point => point.fy))
    yMin = Math.max(...nodes.map(point => point.fy))
    yCenter = (yMax - yMin)/2
    for(let yval of nodes) {
      let yDiff = yMax - yval.fy
      yval.fy = yDiff + (150 - yCenter*scale)
    }
    return(nodes)

    // take the distance between y-mid and all y-values 
  }
  const transformYVals = function(nodes){

    // find the difference between max y-coordinate with all other coordinates
    var maxVal = Math.max(...nodes.map(point => point.fy))
    for (var yval of nodes){
      var diff = maxVal - yval.fy 
      yval.fy = diff+20
    }
    // changes are directly applied to nodes 
    return(nodes)
    
  }

  const onClickNode = function(nodeId) {
      // window.alert(`Clicked node ${nodeId}`);


  };

  const onDoubleClickNode = function(nodeId) {
    console.log(nodeId)
      // window.alert(`Double clicked node ${nodeId}`);
  };

  const onRightClickNode = function(event, nodeId) {
      // window.alert(`Right clicked node ${nodeId}`);
      console.log(event)
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
      //window.alert(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
  };


  return (
    <article>
      <Helmet>
        <title>Home Page</title>
        <meta
          name="description"
          content="A React.js Boilerplate application homepage"
        />
      </Helmet>

      <Button onClick={draw}>test</Button>

      <Graph
          id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
          data={graphData.data}
          config={myConfig}
          onClickNode={onClickNode}
          onDoubleClickNode={onDoubleClickNode}
          onRightClickNode={onRightClickNode}
          onClickGraph={onClickGraph}
          onClickLink={onClickLink}
          onRightClickLink={onRightClickLink}
          onMouseOverNode={onMouseOverNode}
          onMouseOutNode={onMouseOutNode}
          onMouseOverLink={onMouseOverLink}
          onMouseOutLink={onMouseOutLink}
          onNodePositionChange={onNodePositionChange}
      />

      <div>
        <CenteredSection>
          <H2>
            <FormattedMessage {...messages.startProjectHeader} />
          </H2>
          <p>
            <FormattedMessage {...messages.startProjectMessage} />
          </p>
        </CenteredSection>
        <Section>
          <H2>
            <FormattedMessage {...messages.trymeHeader} />
          </H2>
          <Form onSubmit={onSubmitForm}>
            <label htmlFor="username">
              <FormattedMessage {...messages.trymeMessage} />
              <AtPrefix>
                <FormattedMessage {...messages.trymeAtPrefix} />
              </AtPrefix>
              <Input
                id="username"
                type="text"
                placeholder="mxstbr"
                value={username}
                onChange={onChangeUsername}
              />
            </label>
          </Form>
          <ReposList {...reposListProps} />
        </Section>
      </div>
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
  answer: PropTypes.array
};

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  graphData: makeSelectData(),
  answer: makeSelectAnswer(),
  loading: makeSelectLoading(),
  error: makeSelectError()
});

export function mapDispatchToProps(dispatch) {
  return {
    onChangeData: (graph) => dispatch(changeData(graph)),
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
