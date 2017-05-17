
var current_year = 2016;
var points_mode = true; // if points mode is false, then we are in raking mode(sloped graph)

var margin = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 50
};
var width = document.getElementById('viz').offsetWidth*0.7 - margin.left - margin.right;
var height = width / 2 - margin.top - margin.bottom;
var svg = d3.select('#viz').append('svg')
    .attr('width', document.getElementById('viz').offsetWidth + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var years_svg = d3.select("#viz-years").append('svg') // Year svg on left
    .attr('width', document.getElementById('viz-years').offsetWidth)
    .attr('height', 300)
    .append('g');
var transition_duration = 500; //Time of transitions
var teams; // Stores the name of teams
var max_points; // stores maximum points of the season

//Declare d3.scale
var y = d3.scaleLinear().range([height, 0]);
var x = d3.scaleLinear().range([0, width]);

var valueline = d3.line() // Function to return coordinates of line
    .x(function(d) {
        return x(d[0]);
    })
    .y(function(d) {
        return y(d[1]);
    });

var line_points = []; // contains coordinates of points of each line
var team_colors = {}; // Contains colors of each team

//Tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr('id', 'tooltip')
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "visible")
    .style("text-align", "center")
    .style('background', 'red')
    .style('padding-left', '8px')
    .style('padding-right', '8px')
    .style('padding-top', '5px')
    .style('padding-bottom', '5px')
    .html("");

// Add the X Axis
svg.append("g")
    .attr('class', 'x-axis')
    .attr("transform", "translate(0," + height + ")")
    .style('stroke', '#757575')
    .style('stroke-width', '0.7px')
    .style('font-size', '11px')
    //.style('fill', '#cdcdcd')
    .call(d3.axisBottom(x));
// Add the Y Axis
svg.append("g")
    .attr('class', 'y-axis')
    .attr('fill', '#757575')
    //.style('stroke-width', '0.7px')
    .style('font-size', '17px')
    .call(d3.axisLeft(y));

var g; //Lines for all teams
var c;
var l;
var line = {}; // Dict containing all lines
var points = {}; // Dict containing all points
var fd;

create_line_graph();
create_years();

function create_line_graph() {
    line = {};
    points = {};

    $("#ipl-lines").remove(); // remove all lines already present
    $("#ipl-legend").remove(); // remove all legend already present

    d3.csv('data/' + current_year + '.csv', function(full_data) {

        data = full_data;
        fd = $.extend(true, [], full_data);

        g = svg.append('g')
            .attr('id', 'ipl-lines');
        c = g.append('g')
            .selectAll('circle')
            .data(data)
            .enter();
        l = svg.append('g')
            .attr('id', 'ipl-legend');

        teams = Object.keys(data[0]); // Get list of all teams
        for (i = 0; i < teams.length; i++) {
            if (teams[i].split('_')[1] == "comments") {
                teams = removeA(teams, teams[i]);
            }
        }
        teams.forEach(function(d) { //convert points into Int
            data.forEach(function(i) {
                i[d] = +i[d];
            })
        })
        teams = removeA(teams, 'match'); //Remove match from keys

        max_points = 0;
        for (i in teams) { // Get maximum points among all teams
            if (parseInt(data[data.length - 1][teams[i]]) > max_points) {
                max_points = parseInt(data[data.length - 1][teams[i]])
            }
        }
        x.domain([0, data.length - 1]);
        for (i in teams) { // Set colot for teams
            team_colors[teams[i]] = d3.scaleOrdinal(d3.schemeCategory10).range()[i]; // Using already present color pallets from D3
        }
        teams.forEach(function(t) { //Draw lines and circles for each team
            // Create lines at the bottom of chart
            data.forEach(function(d) {
                line_points.push([d['match'], 0]);
            })
            line[t] = g.append('path') // Create Line
                .attr('class', 'ipl_line-' + valid_id(t))
                .attr('stroke', team_colors[t])
                .attr('fill', 'none')
                .attr('stroke-width', '3px')
                .attr('opacity', '0.5')
                .attr("d", valueline(line_points))
                .on('mouseover', function() {
                    var id = d3.select(this).attr('class').split('-')[1];
                    teams.forEach(function(t) {
                        if (valid_id(t) != id) {
                            line[t].style('opacity', '0.3');
                            d3.selectAll('.team_circle-' + valid_id(t)).style('fill', 'transparent');
                            d3.select('#legend-' + valid_id(t)).style('opacity', 0.4);
                        } else {
                            d3.selectAll('.team_circle-' + id).attr('r', 5).style('fill', team_colors[t]);
                        }
                    })
                    d3.select('.ipl_line-' + id).attr('stroke-width', '7px');
                    // Move elements to front
                    d3.select('.ipl_line-' + id).moveToFront();
                    d3.selectAll('.team_circle-' + id).moveToFront();
                })
                .on('mouseout', function() {
                    var id = d3.select(this).attr('class').split('-')[1];
                    teams.forEach(function(t) {
                        line[t].style('opacity', '0.5');
                        d3.selectAll('.team_circle-' + valid_id(t)).style('fill', team_colors[t]);
                        d3.select('#legend-' + valid_id(t)).style('opacity', 1);
                    })
                    d3.select('.ipl_line-' + id).attr('stroke-width', '3px');
                    d3.selectAll('.team_circle-' + id).attr('r', 3);
                    d3.selectAll('.team_circle-' + id).moveToFront();
                });

            points[t] = c.append('circle') // Create Circles
                .attr('class', 'team_circle-' + valid_id(t))
                .attr('cx', function(d) {
                    return x(d['match']);
                })
                .attr('opacity', '0.')
                .attr('cy', function(d) {
                    return y(0)
                })
                .attr('r', 3)
                .style('fill', function(d) {
                    return team_colors[t]
                })
                .on('mouseover', function(d) {
                    var mouse = d3.mouse(this);
                    var id = d3.select(this).attr('class').split('-')[1];
                    teams.forEach(function(t) {
                        if (valid_id(t) != id) {
                            line[t].attr('stroke', '#D3D3D3');
                            d3.selectAll('.team_circle-' + valid_id(t)).style('fill', 'transparent');
                        } else {
                            d3.selectAll('.team_circle-' + id).attr('r', 5).style('fill', team_colors[t]);
                            tooltip.html(d[t + "_comments"]);
                            tooltip.style("visibility", "visible").style("top", (mouse[1]) + "px").style("left", (mouse[0]) + "px");
                        }
                    })
                    d3.select('.ipl_line-' + id).attr('stroke-width', '7px');
                    // Move elements to front
                    d3.select('.ipl_line-' + id).moveToFront();
                    d3.selectAll('.team_circle-' + id).moveToFront();
                })
                .on('mouseout', function() {
                    tooltip.style("visibility", "hidden")
                    var id = d3.select(this).attr('class').split('-')[1];
                    teams.forEach(function(t) {
                        line[t].attr('stroke', team_colors[t]);
                        d3.selectAll('.team_circle-' + valid_id(t)).style('fill', team_colors[t])
                    })
                    d3.select('.ipl_line-' + id).attr('stroke-width', '3px');
                    d3.selectAll('.team_circle-' + id).attr('r', 3);
                    d3.selectAll('.team_circle-' + id).moveToFront();
                });
            line_points = [];

            //Create legend
            l.append('text')
              .attr('id', 'legend-' + valid_id(t))
              .attr('x', width + 20)
              .attr('y', height - (teams.indexOf(t) + 1)/teams.length*height)
              .style('font-size', '17px')
              .style('cursor', 'default')
              .attr('fill', team_colors[t])
              .text(t)
              .on('mouseover', function(){
                  var id = d3.select(this).attr('id').split('-')[1];
                  teams.forEach(function(t) {
                      if (valid_id(t) != id) {
                          line[t].style('opacity', '0.3');
                          d3.selectAll('.team_circle-' + valid_id(t)).style('fill', 'transparent');
                          d3.select('#legend-' + valid_id(t)).style('opacity', 0.4);
                      } else {
                          d3.selectAll('.team_circle-' + id).attr('r', 5).style('fill', team_colors[t]);
                      }
                  })
                  d3.select('.ipl_line-' + id).attr('stroke-width', '7px');
                  // Move elements to front
                  d3.select('.ipl_line-' + id).moveToFront();
                  d3.selectAll('.team_circle-' + id).moveToFront();
              })
              .on('mouseout', function(){
                  var id = d3.select(this).attr('id').split('-')[1];
                  teams.forEach(function(t) {
                      line[t].style('opacity', '0.5');
                      d3.selectAll('.team_circle-' + valid_id(t)).style('fill', team_colors[t]);
                      d3.select('#legend-' + valid_id(t)).style('opacity', 1);
                  })
                  d3.select('.ipl_line-' + id).attr('stroke-width', '3px');
                  d3.selectAll('.team_circle-' + id).attr('r', 3);
                  d3.selectAll('.team_circle-' + id).moveToFront();
              })
        });
        //Create transition of lines
        create_transition();
    });

}

function create_transition() {
    points_mode = !points_mode;
    if (points_mode == true) {
        y.domain([0, max_points]);
        d3.select('.y-axis')
            .transition()
            .duration(transition_duration)
            .call(d3.axisLeft(y).ticks(max_points / 2));
        get_points_data(fd);
    } else {
        y.domain([teams.length, 1]);
        d3.select('.y-axis')
            .transition()
            .duration(transition_duration)
            .call(d3.axisLeft(y).ticks(teams.length));
        data = get_ranking_data(data);
    }

    teams.forEach(function(t) {
        //Create transition of lines
        data.forEach(function(d) {
            line_points.push([d['match'], d[t]]);
        });
        line[t]
            .transition()
            .duration(transition_duration)
            .attr("d", valueline(line_points));
        points[t].transition()
            .duration(transition_duration)
            .attr('cy', function(d) {
                return y(d[t])
            })
        line_points = [];

        if(points_mode != true){
          d3.select('#legend-' + valid_id(t))
              .transition()
              .duration(transition_duration)
              .attr('y', y(data[data.length-1][t]));
        }
    });

    d3.select('.x-axis')
        .transition()
        .duration(transition_duration)
        .call(d3.axisBottom(x));

}

$('#graph-toggle').on('change', function() {
    create_transition();
})

function close_line_graph() {
    teams.forEach(function(t) { //Draw lines and circles for each team
        //CLose transition of lines
        data.forEach(function(d) {
          if(points_mode){
            line_points.push([d['match'], 0]);
          }
          else{
            line_points.push([d['match'], teams.length]);
          }

        })
        line[t]
            .transition()
            .duration(transition_duration)
            .attr("d", valueline(line_points));
        points[t].transition()
            .duration(transition_duration)
            .attr('cy', function(d) {
              if(points_mode){
                return y(0)
              } else{
                return y(teams.length)
              }

            });
        line_points = [];
    })
    points_mode = !points_mode;
    setTimeout(create_line_graph, transition_duration + 100);
}

function create_years() {
    var d;
    for (i = 2008; i < 2018; i++) {
        d = years_svg.append('g')
            .attr('id', 'year-' + i)
            .on('click', function() {
                d3.select('#year-' + current_year).selectAll('circle')
                    .attr('fill', 'transparent');
                d3.select('#year-' + this.id.split('-')[1]).selectAll('circle')
                    .attr('fill', 'red');
                current_year = parseInt(this.id.split('-')[1]);
                close_line_graph();
            });
        d.append('text')
            .attr('x', 40)
            .attr('y', 30 + (i - 2008) * 30)
            .attr('fill', 'black')
            .style('font-size', '17px')
            .style('cursor', 'pointer')
            .text(i);
        d.append('circle')
            .attr('cx', 85)
            .attr('cy', 24 + (i - 2008) * 30)
            .attr('r', 6)
            .attr('fill', function() {
                if (i == current_year) {
                    return 'red';
                }
                return 'transparent';
            })
    }
}

function removeA(arr) {
    // Function to remove a value from list
    var what, a = arguments,
        L = a.length,
        ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function valid_id(name) {
    if (name) {
        var n = name.replace('&', '')
        n = n.split(' ').join('');
        n = n.split('.').join('');
        n = n.split(',').join('');
        n = n.split('/').join('');
        n = n.toLowerCase();
        return n;
    }
}

function get_ranking_data(full_data) {
    // Function which sorts team points depending on their rank
    var k = [];
    var d = {};
    var res = full_data;
    res.forEach(function(i) {
        teams.forEach(function(t) {
            d[t] = i[t];
        });
        var items = Object.keys(d).map(function(key) {
            return [key, d[key]];
        });
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        k.push(items)
    })

    for(i in k) {
        for (j in k[i]) {
            res[i][k[i][j][0]] = (parseInt(j)) + 1;
        }
    }
    return res;
}

function get_points_data(fd) {
    for (i in fd) {
        for (j in fd[i]) {
            data[i][j] = fd[i][j];
        }
    }
    return data;
}
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};
