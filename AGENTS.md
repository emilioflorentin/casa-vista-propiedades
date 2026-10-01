# Architecture decisions

- Keep Spanish administrative boundary data as static TopoJSON and decode it on demand in the shared location overlay, because clickable map zones must work nationwide without a server or geocoding request per interaction.
- Pass selected map boundaries through the existing search selection contract and evaluate polygons in property and Roomie results, because a map section must filter by its real outline rather than an approximate radius.
