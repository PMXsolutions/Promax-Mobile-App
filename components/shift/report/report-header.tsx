import React from "react";
import FormTableDisp from "@/components/shared/form-table-display";
import { formattedTime } from "@/helpers/shift-service";
import { ShiftRosterType } from "@/types/shift";

const ReportFormHeader = ({ item }: { item: ShiftRosterType }) => {
  return (
    <>
      <FormTableDisp label="Client’s Name" value={item?.clients} />
      <FormTableDisp
        label="Shift Start Time"
        value={formattedTime(item?.dateFrom, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Shift End Time"
        value={formattedTime(item?.dateTo, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Date"
        value={formattedTime(item?.dateCreated, "d MMMM, yyyy")}
      />
    </>
  );
};

export default ReportFormHeader;
