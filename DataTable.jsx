import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useTheme, makeStyles } from '@rneui/themed';

const DataTable = ({ columns, rows, cellPadding, cellMargin, tablePadding, tableMargin }) => {
  const styles = useStyles({ cellPadding, cellMargin, tablePadding, tableMargin });
  const { theme } = useTheme();

  const colWidthMap = getColWidthMap(columns, rows);
  const [tableWidth, setTableWidth] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    let totalWidth = 0;
    columns.forEach((column) => {
      totalWidth += colWidthMap[column.dataKey];
    });
    setTableWidth(totalWidth);
  }, []);

  return (
    <View>
      {tableWidth > screenWidth ? (
        <ScrollView horizontal>{renderTable(styles, columns, rows, colWidthMap)}</ScrollView>
      ) : (
        renderTable(styles, columns, rows, colWidthMap)
      )}
    </View>
  );
};

const renderTable = (styles, columns, rows, colWidthMap) => (
  <View style={styles.root}>
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.headerRow}>
        {columns.map((column, colIdx) => (
          <View
            key={colIdx}
            style={[
              styles.headerCell,
              styles.borderRight,
              {
                width: colWidthMap[column.dataKey],
                minWidth: column.minWidth || 100,
                padding: column.cellPadding !== undefined ? column.cellPadding : styles.bodyCell.padding,
                margin: column.cellMargin !== undefined ? column.cellMargin : styles.bodyCell.margin,
              },
              colIdx === columns.length - 1 ? styles.lastHeaderCell : null,
            ]}
          >
            <View>
              {typeof column.headerRender === 'function' ? (
                <View style={styles.headerText}>{column.headerRender()}</View>
              ) : (
                <Text style={styles.headerText}>{column.title}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Body */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.bodyRow}>
          {columns.map((column, colIdx) => (
            <View
              key={colIdx}
              style={[
                styles.bodyCell,
                styles.borderRight,
                styles.borderBottom,
                { width: colWidthMap[column.dataKey], minWidth: column.minWidth || 100 },
                colIdx === columns.length - 1 ? styles.lastBodyCell : null,
              ]}
            >
              <View>{typeof column.render === 'function' ? <View>{row[column.dataKey]}</View> : <Text>{row[column.dataKey]}</Text>}</View>
            </View>
          ))}
        </View>
      ))}
    </View>
  </View>
);

const getColWidthMap = (columns, rows) => {
  const colWidthList = columns.map((column) => {
    const values = rows.flatMap((row) => {
      const cellValue = row[column.dataKey] || '';
      return [cellValue]; // Collect all cell values
    });
    const charLength = [column.title, ...values].sort((a, b) => b.length - a.length)[0]?.length;

    const calculatedWidth = Math.max(
      Math.round(charLength * (column.widthMultiplier || 1) * (column.charWidth || 10)),
      column.minWidth || 100 // Consider the minimum width here
    );

    const maxWidth = column.maxWidth || undefined; // Use the specified maxWidth or undefined

    const finalWidth = maxWidth !== undefined ? Math.min(calculatedWidth, maxWidth) : calculatedWidth; // Apply maxWidth if defined

    return { dataKey: column.dataKey, width: finalWidth };
  });
  const colWidthMap = colWidthList.reduce((acc, col) => ({ ...acc, [col.dataKey]: col.width }), {});
  return colWidthMap;
};

const useStyles = makeStyles((theme, props) => ({
  root: {
    padding: props.tablePadding !== undefined ? props.tablePadding : 12,
    margin: props.tableMargin !== undefined ? props.tableMargin : 0,
  },
  table: {
    backgroundColor: theme.colors.card,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: props.cellPadding !== undefined ? props.cellPadding : 10,
    margin: props.cellMargin !== undefined ? props.cellMargin : 0,
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  headerText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: '#d6d3d1',
  },
  bodyRow: {
    flexDirection: 'row',
  },
  bodyCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: props.cellPadding !== undefined ? props.cellPadding : 10,
    margin: props.cellMargin !== undefined ? props.cellMargin : 0,
  },
  lastBodyCell: {
    borderRightWidth: 0,
  },
  bodyText: {
    color: theme.colors.text,
  },
  colorWhite: {
    color: 'white',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: '#d6d3d1',
  },
  whiteColor: {
    color: 'white',
  },
}));

export default DataTable;